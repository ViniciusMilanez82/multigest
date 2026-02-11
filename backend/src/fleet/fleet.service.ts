import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CreateTransportOrderDto } from './dto/create-transport-order.dto';

@Injectable()
export class FleetService {
  constructor(private prisma: PrismaService) {}

  // ─── VEHICLES ───

  async createVehicle(companyId: string, dto: CreateVehicleDto) {
    const exists = await this.prisma.vehicle.findFirst({ where: { plate: dto.plate, deletedAt: null } });
    if (exists) throw new ConflictException('Veículo com esta placa já existe');
    return this.prisma.vehicle.create({ data: { companyId, ...dto } });
  }

  async listVehicles(companyId: string, query: any) {
    const { search, status, page = 1, limit = 20 } = query;
    const where: any = { companyId, deletedAt: null };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { plate: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where }),
    ]);
    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async getVehicle(companyId: string, id: string) {
    const v = await this.prisma.vehicle.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { fuelRecords: { take: 10, orderBy: { date: 'desc' } }, maintenances: { take: 10, orderBy: { startDate: 'desc' } } },
    });
    if (!v) throw new NotFoundException('Veículo não encontrado');
    return v;
  }

  async updateVehicle(companyId: string, id: string, dto: UpdateVehicleDto) {
    await this.getVehicle(companyId, id);
    return this.prisma.vehicle.update({ where: { id }, data: dto });
  }

  async deleteVehicle(companyId: string, id: string) {
    await this.getVehicle(companyId, id);
    return this.prisma.vehicle.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  }

  // ─── TRANSPORT ORDERS ───

  async createTransportOrder(companyId: string, userId: string, dto: CreateTransportOrderDto) {
    return this.prisma.transportOrder.create({
      data: { ...dto, requestedBy: userId, scheduledDate: new Date(dto.scheduledDate) },
    });
  }

  async listTransportOrders(companyId: string, query: any) {
    const { status, type, page = 1, limit = 20 } = query;
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    // Filter by vehicles/assets of this company
    where.OR = [
      { vehicle: { companyId } },
      { asset: { companyId } },
      { requestedByUser: { companyId } },
    ];
    const [data, total] = await Promise.all([
      this.prisma.transportOrder.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { scheduledDate: 'desc' },
        include: { vehicle: true, driver: true, asset: { select: { id: true, code: true, notes: true } } },
      }),
      this.prisma.transportOrder.count({ where }),
    ]);
    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async getTransportOrder(id: string) {
    const order = await this.prisma.transportOrder.findUnique({
      where: { id },
      include: { vehicle: true, driver: true, asset: { select: { id: true, code: true, notes: true } } },
    });
    if (!order) throw new NotFoundException('Ordem de transporte não encontrada');
    return order;
  }

  async updateTransportOrderStatus(id: string, status: string, completedDate?: string) {
    await this.getTransportOrder(id);
    const data: any = { status };
    if (completedDate) data.completedDate = new Date(completedDate);
    if (status === 'COMPLETED' && !completedDate) data.completedDate = new Date();
    return this.prisma.transportOrder.update({ where: { id }, data });
  }

  // ─── DRIVERS ───

  async createDriver(companyId: string, dto: any) {
    return this.prisma.driver.create({ data: { companyId, ...dto, cnhExpiry: new Date(dto.cnhExpiry) } });
  }

  async listDrivers(companyId: string) {
    return this.prisma.driver.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } });
  }

  async getDriver(companyId: string, id: string) {
    const d = await this.prisma.driver.findFirst({ where: { id, companyId } });
    if (!d) throw new NotFoundException('Motorista não encontrado');
    return d;
  }

  async updateDriver(companyId: string, id: string, dto: any) {
    await this.getDriver(companyId, id);
    const data = { ...dto };
    if (dto.cnhExpiry) data.cnhExpiry = new Date(dto.cnhExpiry);
    return this.prisma.driver.update({ where: { id }, data });
  }

  async deleteDriver(companyId: string, id: string) {
    await this.getDriver(companyId, id);
    return this.prisma.driver.update({ where: { id }, data: { isActive: false } });
  }

  // ─── FUEL RECORDS ───

  async addFuelRecord(vehicleId: string, dto: any) {
    const record = await this.prisma.fuelRecord.create({
      data: { vehicleId, date: new Date(dto.date), liters: dto.liters, totalCost: dto.totalCost, currentKm: dto.currentKm, station: dto.station, notes: dto.notes },
    });
    await this.prisma.vehicle.update({ where: { id: vehicleId }, data: { currentKm: dto.currentKm } });
    return record;
  }

  async listFuelRecords(vehicleId: string) {
    return this.prisma.fuelRecord.findMany({ where: { vehicleId }, orderBy: { date: 'desc' }, take: 50 });
  }

  // ─── VEHICLE MAINTENANCE ───

  async addVehicleMaintenance(vehicleId: string, dto: any) {
    return this.prisma.vehicleMaintenance.create({
      data: {
        vehicleId, supplierId: dto.supplierId, type: dto.type || 'CORRECTIVE', description: dto.description,
        cost: dto.cost, currentKm: dto.currentKm, startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null, partsReplaced: dto.partsReplaced, notes: dto.notes,
      },
    });
  }

  async listVehicleMaintenances(vehicleId: string) {
    return this.prisma.vehicleMaintenance.findMany({ where: { vehicleId }, orderBy: { startDate: 'desc' }, take: 50, include: { supplier: { select: { razaoSocial: true } } } });
  }

  // ─── CHECKLISTS ───

  async addChecklist(vehicleId: string, dto: any) {
    return this.prisma.vehicleChecklist.create({
      data: { vehicleId, checkDate: new Date(dto.checkDate || new Date()), checkedBy: dto.checkedBy, items: dto.items, overallStatus: dto.overallStatus, notes: dto.notes },
    });
  }

  async listChecklists(vehicleId: string) {
    return this.prisma.vehicleChecklist.findMany({ where: { vehicleId }, orderBy: { checkDate: 'desc' }, take: 20 });
  }

  // ─── DASHBOARD STATS ───

  async getStats(companyId: string) {
    const [totalVehicles, available, inOperation, inMaintenance] = await Promise.all([
      this.prisma.vehicle.count({ where: { companyId, deletedAt: null } }),
      this.prisma.vehicle.count({ where: { companyId, deletedAt: null, status: 'AVAILABLE' } }),
      this.prisma.vehicle.count({ where: { companyId, deletedAt: null, status: 'IN_OPERATION' } }),
      this.prisma.vehicle.count({ where: { companyId, deletedAt: null, status: 'IN_MAINTENANCE' } }),
    ]);
    return { totalVehicles, available, inOperation, inMaintenance };
  }
}
