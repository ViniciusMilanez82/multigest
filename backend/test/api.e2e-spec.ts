/**
 * MultiGest — Testes E2E Exaustivos
 * Testa todas as rotas e subrotinas do backend.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-min-32-chars!!';

describe('MultiGest API (e2e)', () => {
  let app: INestApplication<App>;
  let token = '';
  let companyId = '';
  let customerId: string;
  let contractId: string;
  let assetId: string;
  let assetTypeId: string;
  let stockLocationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  }, 15000);

  afterAll(async () => {
    await app?.close();
  }, 5000);

  describe('1. Auth', () => {
    it('POST /auth/login — senha curta retorna 400 (validation)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'invalido@test.com', password: '12345' })
        .expect(400);
    });

    it('POST /auth/login — credenciais inválidas retorna 401', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'invalido@test.com', password: 'wrong12' })
        .expect(401);
    });

    it('POST /auth/login — login válido retorna token e empresas', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@multigest.com.br', password: 'admin123' })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.companies).toBeDefined();
      expect(res.body.user.companies.length).toBeGreaterThan(0);

      token = res.body.accessToken;
      companyId = res.body.user.companies[0].id;
    }, 10000);

    it('GET /auth/me — retorna usuário logado', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('admin@multigest.com.br');
          expect(res.body.companies).toBeDefined();
        });
    });

    it('GET /auth/me — sem token retorna 401', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });
  });

  const auth = () => {
    if (!token || !companyId) throw new Error('Faça login antes de chamar auth()');
    return {
      Authorization: `Bearer ${token}`,
      'x-company-id': companyId,
    };
  };

  describe('2. Companies', () => {
    it('GET /companies — lista empresas (usa token, user.companies do payload)', () => {
      return request(app.getHttpServer())
        .get('/companies')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('3. Customers', () => {
    it('POST /customers — criar cliente', async () => {
      const res = await request(app.getHttpServer())
        .post('/customers')
        .set(auth())
        .send({
          razaoSocial: 'Cliente Teste E2E',
          cpfCnpj: '11.222.333/0001-44',
          email: 'cliente@teste.e2e',
          phone: '11999999999',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      customerId = res.body.id;
    });

    it('GET /customers — lista clientes', () => {
      return request(app.getHttpServer())
        .get('/customers')
        .set(auth())
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /customers/:id — busca cliente', () => {
      return request(app.getHttpServer())
        .get(`/customers/${customerId}`)
        .set(auth())
        .expect(200)
        .expect((res) => {
          expect(res.body.razaoSocial).toBe('Cliente Teste E2E');
        });
    });

    it('PATCH /customers/:id — atualiza cliente', () => {
      return request(app.getHttpServer())
        .patch(`/customers/${customerId}`)
        .set(auth())
        .send({ phone: '11888888888' })
        .expect(200);
    });
  });

  describe('4. Asset Types', () => {
    it('GET /asset-types — lista tipos', async () => {
      const res = await request(app.getHttpServer())
        .get('/asset-types')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) assetTypeId = res.body[0].id;
    });
  });

  describe('5. Stock Locations', () => {
    it('POST /stock-locations — criar local', async () => {
      const res = await request(app.getHttpServer())
        .post('/stock-locations')
        .set(auth())
        .send({ name: 'Pátio Teste E2E', code: 'PT-E2E' })
        .expect(201);

      stockLocationId = res.body.id;
    });

    it('GET /stock-locations — lista locais', () => {
      return request(app.getHttpServer())
        .get('/stock-locations')
        .set(auth())
        .expect(200);
    });
  });

  describe('6. Assets', () => {
    it('POST /assets — criar ativo', async () => {
      if (!assetTypeId) {
        const atRes = await request(app.getHttpServer())
          .get('/asset-types')
          .set('Authorization', `Bearer ${token}`);
        if (atRes.body?.length > 0) assetTypeId = atRes.body[0].id;
      }
      expect(assetTypeId).toBeDefined();

      const res = await request(app.getHttpServer())
        .post('/assets')
        .set(auth())
        .send({
          code: 'E2E-001',
          assetTypeId,
          status: 'AVAILABLE',
        })
        .expect(201);

      assetId = res.body.id;
    });

    it('GET /assets — lista ativos', () => {
      return request(app.getHttpServer())
        .get('/assets')
        .set(auth())
        .expect(200);
    });

    it('GET /assets/:id — busca ativo', () => {
      return request(app.getHttpServer())
        .get(`/assets/${assetId}`)
        .set(auth())
        .expect(200);
    });
  });

  describe('7. Contracts', () => {
    it('POST /contracts — criar contrato', async () => {
      const res = await request(app.getHttpServer())
        .post('/contracts')
        .set(auth())
        .send({
          customerId,
          contractNumber: 'CTR-E2E-001',
          type: 'MEDICAO',
          status: 'DRAFT',
          startDate: '2026-03-01',
          endDate: '2026-12-31',
        })
        .expect(201);

      contractId = res.body.id;
    });

    it('GET /contracts — lista contratos', () => {
      return request(app.getHttpServer())
        .get('/contracts')
        .set(auth())
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('GET /contracts/:id — busca contrato', () => {
      return request(app.getHttpServer())
        .get(`/contracts/${contractId}`)
        .set(auth())
        .expect(200)
        .expect((res) => {
          expect(res.body.contractNumber).toBe('CTR-E2E-001');
        });
    });

    it('POST /contracts/:id/items — adicionar item', () => {
      return request(app.getHttpServer())
        .post(`/contracts/${contractId}/items`)
        .set(auth())
        .send({
          assetId,
          dailyRate: 150,
          monthlyRate: 4500,
          startDate: '2026-03-01',
          endDate: '2026-12-31',
        })
        .expect(201);
    });

    it('GET /contracts/reajuste-igpm/preview — preview reajuste', () => {
      return request(app.getHttpServer())
        .get('/contracts/reajuste-igpm/preview?percentual=5')
        .set(auth())
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('valorAtualMensal');
          expect(res.body).toHaveProperty('valorAposReajuste');
        });
    });

    it('GET /contracts/:id/supply-orders/next-number — próximo número AF', () => {
      return request(app.getHttpServer())
        .get(`/contracts/${contractId}/supply-orders/next-number`)
        .set(auth())
        .expect(200)
        .expect((res) => {
          expect(res.body.nextNumber).toBeDefined();
        });
    });

    it('GET /contracts/:id/measurements — lista medições', () => {
      return request(app.getHttpServer())
        .get(`/contracts/${contractId}/measurements`)
        .set(auth())
        .expect(200);
    });

    it('GET /contracts/:id/movements — lista movimentações', () => {
      return request(app.getHttpServer())
        .get(`/contracts/${contractId}/movements`)
        .set(auth())
        .expect(200);
    });

    it('GET /contracts/:id/addendums — lista aditivos', () => {
      return request(app.getHttpServer())
        .get(`/contracts/${contractId}/addendums`)
        .set(auth())
        .expect(200);
    });

    it('GET /contracts/:id/analyses — lista análises', () => {
      return request(app.getHttpServer())
        .get(`/contracts/${contractId}/analyses`)
        .set(auth())
        .expect(200);
    });

    it('GET /contracts/:id/supply-orders — lista documentos AF', () => {
      return request(app.getHttpServer())
        .get(`/contracts/${contractId}/supply-orders`)
        .set(auth())
        .expect(200);
    });
  });

  describe('8. Dashboard', () => {
    it('GET /dashboard/overview — overview do dashboard', () => {
      return request(app.getHttpServer())
        .get('/dashboard/overview')
        .set(auth())
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalCustomers');
          expect(res.body).toHaveProperty('activeContracts');
        });
    });

    it('GET /dashboard/expedition — painel de expedição (items + serviceOrders)', () => {
      return request(app.getHttpServer())
        .get('/dashboard/expedition')
        .set(auth())
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('serviceOrders');
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(Array.isArray(res.body.serviceOrders)).toBe(true);
        });
    });

    it('GET /dashboard/expedition?start=&end= — com filtro de período', () => {
      const start = new Date().toISOString().slice(0, 10);
      const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      return request(app.getHttpServer())
        .get(`/dashboard/expedition?start=${start}&end=${end}`)
        .set(auth())
        .expect(200);
    });
  });

  describe('9. Service Orders', () => {
    let serviceOrderId: string;

    it('POST /service-orders — criar OS', async () => {
      const res = await request(app.getHttpServer())
        .post('/service-orders')
        .set(auth())
        .send({
          contractId,
          type: 'INSTALACAO',
        })
        .expect(201);

      serviceOrderId = res.body.id;
    });

    it('GET /service-orders — lista OS', () => {
      return request(app.getHttpServer())
        .get('/service-orders')
        .set(auth())
        .expect(200);
    });

    it('GET /service-orders/:id — busca OS', () => {
      return request(app.getHttpServer())
        .get(`/service-orders/${serviceOrderId}`)
        .set(auth())
        .expect(200);
    });
  });

  describe('10. Invoices', () => {
    it('GET /invoices — lista faturas', () => {
      return request(app.getHttpServer())
        .get('/invoices')
        .set(auth())
        .expect(200);
    });

    it('GET /invoices/stats — estatísticas', () => {
      return request(app.getHttpServer())
        .get('/invoices/stats')
        .set(auth())
        .expect(200);
    });

    it('GET /invoices/next-number — próximo número', () => {
      return request(app.getHttpServer())
        .get('/invoices/next-number')
        .set(auth())
        .expect(200);
    });
  });

  describe('11. Fleet', () => {
    it('GET /fleet/vehicles — lista veículos', () => {
      return request(app.getHttpServer())
        .get('/fleet/vehicles')
        .set(auth())
        .expect(200);
    });

    it('GET /fleet/drivers — lista motoristas', () => {
      return request(app.getHttpServer())
        .get('/fleet/drivers')
        .set(auth())
        .expect(200);
    });
  });

  describe('12. Proposals', () => {
    it('GET /proposals — lista propostas', () => {
      return request(app.getHttpServer())
        .get('/proposals')
        .set(auth())
        .expect(200);
    });
  });

  describe('13. Biddings', () => {
    it('GET /biddings — lista licitações', () => {
      return request(app.getHttpServer())
        .get('/biddings')
        .set(auth())
        .expect(200);
    });
  });

  describe('14. Suppliers', () => {
    it('GET /suppliers — lista fornecedores', () => {
      return request(app.getHttpServer())
        .get('/suppliers')
        .set(auth())
        .expect(200);
    });
  });
});
