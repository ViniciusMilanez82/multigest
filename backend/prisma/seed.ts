import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env['DATABASE_URL'] || '';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('Seeding MultiGest database...');

  // Criar tipos de ativos
  const assetTypes = await Promise.all([
    prisma.assetType.upsert({
      where: { name: "Container 20'" },
      update: {},
      create: { name: "Container 20'", description: 'Container padrão de 20 pés' },
    }),
    prisma.assetType.upsert({
      where: { name: "Container 40'" },
      update: {},
      create: { name: "Container 40'", description: 'Container padrão de 40 pés' },
    }),
    prisma.assetType.upsert({
      where: { name: 'Módulo Habitacional' },
      update: {},
      create: { name: 'Módulo Habitacional', description: 'Módulo habitacional para alojamento' },
    }),
    prisma.assetType.upsert({
      where: { name: 'Módulo Escritório' },
      update: {},
      create: { name: 'Módulo Escritório', description: 'Módulo para escritório/administrativo' },
    }),
    prisma.assetType.upsert({
      where: { name: 'Módulo Sanitário' },
      update: {},
      create: { name: 'Módulo Sanitário', description: 'Módulo com banheiros' },
    }),
    prisma.assetType.upsert({
      where: { name: 'Módulo Refeitório' },
      update: {},
      create: { name: 'Módulo Refeitório', description: 'Módulo para refeitório/cozinha' },
    }),
  ]);

  // Criar empresas
  const multiMacae = await prisma.company.upsert({
    where: { cnpj: '00.000.000/0001-01' },
    update: {},
    create: {
      cnpj: '00.000.000/0001-01',
      razaoSocial: 'Multi Macaé Locações Ltda',
      nomeFantasia: 'Multi Macaé',
      city: 'Macaé',
      state: 'RJ',
      phone: '(22) 2222-1111',
      email: 'contato@multimacae.com.br',
    },
  });

  const multiRio = await prisma.company.upsert({
    where: { cnpj: '00.000.000/0002-02' },
    update: {},
    create: {
      cnpj: '00.000.000/0002-02',
      razaoSocial: 'Multi Rio Locações Ltda',
      nomeFantasia: 'Multi Rio',
      city: 'Rio de Janeiro',
      state: 'RJ',
      phone: '(21) 3333-2222',
      email: 'contato@multirio.com.br',
    },
  });

  const petroteiner = await prisma.company.upsert({
    where: { cnpj: '00.000.000/0003-03' },
    update: {},
    create: {
      cnpj: '00.000.000/0003-03',
      razaoSocial: 'Petroteiner Serviços Ltda',
      nomeFantasia: 'Petroteiner',
      city: 'Macaé',
      state: 'RJ',
      phone: '(22) 2222-3333',
      email: 'contato@petroteiner.com.br',
    },
  });

  // Criar usuário admin
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@multigest.com.br' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@multigest.com.br',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // Vincular admin a todas as empresas
  for (const company of [multiMacae, multiRio, petroteiner]) {
    await prisma.userCompany.upsert({
      where: {
        userId_companyId: { userId: admin.id, companyId: company.id },
      },
      update: {},
      create: { userId: admin.id, companyId: company.id },
    });
  }

  console.log('Seed concluído!');
  console.log('---');
  console.log('Login admin: admin@multigest.com.br / admin123');
  console.log(`Empresas: ${multiMacae.nomeFantasia}, ${multiRio.nomeFantasia}, ${petroteiner.nomeFantasia}`);
  console.log(`Tipos de ativos: ${assetTypes.map((t) => t.name).join(', ')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
