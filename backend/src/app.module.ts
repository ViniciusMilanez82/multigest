import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { CustomersModule } from './customers/customers.module';
import { AssetsModule } from './assets/assets.module';
import { AssetTypesModule } from './asset-types/asset-types.module';
import { ContractsModule } from './contracts/contracts.module';
import { FleetModule } from './fleet/fleet.module';
import { InvoicesModule } from './invoices/invoices.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { StockLocationsModule } from './stock-locations/stock-locations.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { BiddingsModule } from './biddings/biddings.module';
import { ProposalsModule } from './proposals/proposals.module';
import { ServiceOrdersModule } from './service-orders/service-orders.module';
import { ItemFamiliesModule } from './item-families/item-families.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    PrismaModule,
    AuthModule,
    CompaniesModule,
    CustomersModule,
    AssetsModule,
    AssetTypesModule,
    ContractsModule,
    FleetModule,
    InvoicesModule,
    DashboardModule,
    StockLocationsModule,
    SuppliersModule,
    BiddingsModule,
    ProposalsModule,
    ServiceOrdersModule,
    ItemFamiliesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
