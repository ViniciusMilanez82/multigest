// Configuração de cache e otimização de performance para o backend
const redis = require('redis');
const { promisify } = require('util');
const NodeCache = require('node-cache');

// Configuração do Redis (se disponível no ambiente)
let redisClient;
let getAsync;
let setAsync;

// Cache local para fallback ou uso em desenvolvimento
const localCache = new NodeCache({
  stdTTL: 300, // 5 minutos de TTL padrão
  checkperiod: 60, // Verificar expiração a cada 60 segundos
  maxKeys: 1000 // Limitar número máximo de chaves
});

// Inicializar Redis se configurado
async function initializeCache() {
  if (process.env.REDIS_URL) {
    try {
      redisClient = redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
        }
      });

      redisClient.on('error', (err) => {
        console.error('Erro na conexão Redis:', err);
        console.log('Usando cache local como fallback');
      });

      redisClient.on('connect', () => {
        console.log('Conexão Redis estabelecida com sucesso');
      });

      await redisClient.connect();
      
      // Promisify Redis methods
      getAsync = promisify(redisClient.get).bind(redisClient);
      setAsync = promisify(redisClient.set).bind(redisClient);
      
      return true;
    } catch (err) {
      console.error('Falha ao inicializar Redis:', err);
      console.log('Usando cache local como fallback');
      return false;
    }
  } else {
    console.log('Redis não configurado, usando cache local');
    return false;
  }
}

// Função para obter dados do cache
async function getFromCache(key) {
  try {
    if (redisClient && redisClient.isReady) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      return localCache.get(key);
    }
  } catch (err) {
    console.error('Erro ao obter dados do cache:', err);
    return null;
  }
}

// Função para armazenar dados no cache
async function setInCache(key, data, ttl = 300) {
  try {
    if (redisClient && redisClient.isReady) {
      await redisClient.set(key, JSON.stringify(data), {
        EX: ttl
      });
    } else {
      localCache.set(key, data, ttl);
    }
    return true;
  } catch (err) {
    console.error('Erro ao armazenar dados no cache:', err);
    return false;
  }
}

// Função para invalidar cache
async function invalidateCache(pattern) {
  try {
    if (redisClient && redisClient.isReady) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } else {
      // Para o cache local, precisamos ser mais específicos
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        const allKeys = localCache.keys();
        const matchingKeys = allKeys.filter(key => key.startsWith(prefix));
        matchingKeys.forEach(key => localCache.del(key));
      } else {
        localCache.del(pattern);
      }
    }
    return true;
  } catch (err) {
    console.error('Erro ao invalidar cache:', err);
    return false;
  }
}

// Middleware para cache de resposta
function cacheMiddleware(ttl = 300) {
  return async (req, res, next) => {
    // Não aplicar cache para métodos não-GET ou usuários não autenticados
    if (req.method !== 'GET' || !req.user) {
      return next();
    }

    // Criar chave de cache baseada na URL e ID do usuário
    const cacheKey = `cache:${req.user.id}:${req.originalUrl}`;

    try {
      // Tentar obter do cache
      const cachedData = await getFromCache(cacheKey);
      
      if (cachedData) {
        // Adicionar header indicando cache hit
        res.set('X-Cache', 'HIT');
        return res.json(cachedData);
      }

      // Cache miss - armazenar resposta original
      const originalSend = res.json;
      
      res.json = function(body) {
        // Restaurar método original
        res.json = originalSend;
        
        // Armazenar no cache apenas se for resposta de sucesso
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setInCache(cacheKey, body, ttl)
            .catch(err => console.error('Erro ao armazenar em cache:', err));
        }
        
        // Adicionar header indicando cache miss
        res.set('X-Cache', 'MISS');
        
        // Chamar o método original
        return originalSend.call(this, body);
      };
      
      next();
    } catch (err) {
      console.error('Erro no middleware de cache:', err);
      next();
    }
  };
}

// Exportar funções e middleware
module.exports = {
  initializeCache,
  getFromCache,
  setInCache,
  invalidateCache,
  cacheMiddleware
};
