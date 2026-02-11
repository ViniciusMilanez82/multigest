import { Controller, Get, Headers, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyGuard } from '../auth/company.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getOverview(@Headers('x-company-id') companyId: string) {
    return this.dashboardService.getOverview(companyId);
  }

  @Get('expedition')
  getExpeditionPanel(@Headers('x-company-id') companyId: string, @Query() query: any) {
    return this.dashboardService.getExpeditionPanel(companyId, query);
  }
}
