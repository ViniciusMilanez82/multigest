import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Headers, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyGuard } from '../auth/company.guard';
import { FleetService } from './fleet.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CreateTransportOrderDto } from './dto/create-transport-order.dto';
import { CreateDriverDto, UpdateDriverDto } from './dto/create-driver.dto';
import { CreateFuelRecordDto, CreateVehicleMaintenanceDto, CreateChecklistDto } from './dto/create-fuel-record.dto';

@ApiTags('Fleet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard)
@Controller()
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  // ─── VEHICLES ───

  @Post('vehicles')
  createVehicle(@Headers('x-company-id') companyId: string, @Body() dto: CreateVehicleDto) {
    return this.fleetService.createVehicle(companyId, dto);
  }

  @Get('vehicles')
  listVehicles(@Headers('x-company-id') companyId: string, @Query() query: any) {
    return this.fleetService.listVehicles(companyId, query);
  }

  @Get('vehicles/stats')
  getVehicleStats(@Headers('x-company-id') companyId: string) {
    return this.fleetService.getStats(companyId);
  }

  @Get('vehicles/:id')
  getVehicle(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.fleetService.getVehicle(companyId, id);
  }

  @Put('vehicles/:id')
  updateVehicle(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.fleetService.updateVehicle(companyId, id, dto);
  }

  @Delete('vehicles/:id')
  deleteVehicle(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.fleetService.deleteVehicle(companyId, id);
  }

  // ─── TRANSPORT ORDERS ───

  @Post('transport-orders')
  createTransportOrder(@Headers('x-company-id') companyId: string, @Req() req: any, @Body() dto: CreateTransportOrderDto) {
    return this.fleetService.createTransportOrder(companyId, req.user?.sub, dto);
  }

  @Get('transport-orders')
  listTransportOrders(@Headers('x-company-id') companyId: string, @Query() query: any) {
    return this.fleetService.listTransportOrders(companyId, query);
  }

  @Get('transport-orders/:id')
  getTransportOrder(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.fleetService.getTransportOrder(id);
  }

  @Patch('transport-orders/:id/status')
  updateTransportOrderStatus(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() body: { status: string; completedDate?: string }) {
    return this.fleetService.updateTransportOrderStatus(id, body.status, body.completedDate);
  }

  // ─── DRIVERS ───

  @Post('drivers')
  createDriver(@Headers('x-company-id') companyId: string, @Body() dto: CreateDriverDto) {
    return this.fleetService.createDriver(companyId, dto);
  }

  @Get('drivers')
  listDrivers(@Headers('x-company-id') companyId: string) {
    return this.fleetService.listDrivers(companyId);
  }

  @Get('drivers/:id')
  getDriver(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.fleetService.getDriver(companyId, id);
  }

  @Put('drivers/:id')
  updateDriver(@Headers('x-company-id') companyId: string, @Param('id') id: string, @Body() dto: UpdateDriverDto) {
    return this.fleetService.updateDriver(companyId, id, dto);
  }

  @Delete('drivers/:id')
  deleteDriver(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.fleetService.deleteDriver(companyId, id);
  }

  // ─── FUEL / MAINTENANCE / CHECKLISTS ───

  @Post('vehicles/:id/fuel')
  addFuelRecord(@Headers('x-company-id') companyId: string, @Param('id') vehicleId: string, @Body() dto: CreateFuelRecordDto) {
    return this.fleetService.addFuelRecord(vehicleId, dto);
  }

  @Get('vehicles/:id/fuel')
  listFuelRecords(@Headers('x-company-id') companyId: string, @Param('id') vehicleId: string) {
    return this.fleetService.listFuelRecords(vehicleId);
  }

  @Post('vehicles/:id/maintenances')
  addVehicleMaintenance(@Headers('x-company-id') companyId: string, @Param('id') vehicleId: string, @Body() dto: CreateVehicleMaintenanceDto) {
    return this.fleetService.addVehicleMaintenance(vehicleId, dto);
  }

  @Get('vehicles/:id/maintenances')
  listVehicleMaintenances(@Headers('x-company-id') companyId: string, @Param('id') vehicleId: string) {
    return this.fleetService.listVehicleMaintenances(vehicleId);
  }

  @Post('vehicles/:id/checklists')
  addChecklist(@Headers('x-company-id') companyId: string, @Param('id') vehicleId: string, @Body() dto: CreateChecklistDto) {
    return this.fleetService.addChecklist(vehicleId, dto);
  }

  @Get('vehicles/:id/checklists')
  listChecklists(@Headers('x-company-id') companyId: string, @Param('id') vehicleId: string) {
    return this.fleetService.listChecklists(vehicleId);
  }
}
