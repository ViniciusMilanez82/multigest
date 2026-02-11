"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Pencil,
  RefreshCw,
  Loader2,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Hash,
  Ruler,
  Factory,
  FileText,
  Plus,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

interface AssetType {
  id: string;
  name: string;
}

interface Asset {
  id: string;
  code: string;
  serialNumber?: string;
  manufacturer?: string;
  manufacturingYear?: number;
  width?: number;
  height?: number;
  length?: number;
  condition: string;
  status: string;
  currentLocation?: string;
  currentLocationId?: string;
  currentStockLocation?: { id: string; name: string; customer?: { razaoSocial: string } | null };
  dailyRate: number | string;
  notes?: string;
  assetType?: AssetType;
  createdAt?: string;
  updatedAt?: string;
}

interface LocationHistory {
  id: string;
  movementDate: string;
  movementType: string;
  notes?: string;
  fromLocation?: { id: string; name: string; customer?: { razaoSocial: string } | null } | null;
  toLocation: { id: string; name: string; customer?: { razaoSocial: string } | null };
}

interface StatusHistory {
  id: string;
  fromStatus: string;
  toStatus: string;
  reason?: string;
  changedAt: string;
  changedBy?: { name: string } | string;
}

interface Maintenance {
  id: string;
  type: string;
  description: string;
  cost?: number | string;
  startDate: string;
  endDate?: string;
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponível",
  RENTED: "Alugado",
  IN_MAINTENANCE: "Em Manutenção",
  IN_TRANSIT: "Em Trânsito",
  DECOMMISSIONED: "Baixado",
};

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  RENTED: "bg-blue-100 text-blue-800",
  IN_MAINTENANCE: "bg-yellow-100 text-yellow-800",
  IN_TRANSIT: "bg-orange-100 text-orange-800",
  DECOMMISSIONED: "bg-red-100 text-red-800",
};

const CONDITION_LABELS: Record<string, string> = {
  EXCELLENT: "Excelente",
  GOOD: "Bom",
  FAIR: "Regular",
  POOR: "Ruim",
};

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Disponível" },
  { value: "RENTED", label: "Alugado" },
  { value: "IN_MAINTENANCE", label: "Em Manutenção" },
  { value: "IN_TRANSIT", label: "Em Trânsito" },
  { value: "DECOMMISSIONED", label: "Baixado" },
];

const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  PREVENTIVE: "Preventiva",
  CORRECTIVE: "Corretiva",
  INSPECTION: "Inspeção",
};

function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("pt-BR");
  } catch {
    return "—";
  }
}

export default function AtivoDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const fetchAsset = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/assets/${id}`);
      setAsset(data);
    } catch {
      toast.error("Erro ao carregar ativo.");
      router.push("/dashboard/ativos");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  const fetchStatusHistory = useCallback(async () => {
    try {
      const { data } = await api.get(`/assets/${id}/status-history`);
      setStatusHistory(Array.isArray(data) ? data : data.data || []);
    } catch {
      setStatusHistory([]);
    }
  }, [id]);

  const fetchMaintenances = useCallback(async () => {
    try {
      const { data } = await api.get(`/assets/${id}/maintenances`);
      setMaintenances(Array.isArray(data) ? data : data.data || []);
    } catch {
      setMaintenances([]);
    }
  }, [id]);

  useEffect(() => {
    fetchAsset();
    fetchStatusHistory();
    fetchMaintenances();
    fetchLocationHistory();
  }, [fetchAsset, fetchStatusHistory, fetchMaintenances]);

  async function fetchLocationHistory() {
    try {
      const { data } = await api.get(`/stock-locations/asset/${id}/history`);
      setLocationHistory(data);
    } catch { }
  }

  async function handleStatusChange() {
    if (!newStatus) return;
    setIsChangingStatus(true);
    try {
      await api.patch(`/assets/${id}/status`, {
        status: newStatus,
        reason: statusReason || undefined,
      });
      toast.success("Status alterado com sucesso!");
      setStatusDialogOpen(false);
      setNewStatus("");
      setStatusReason("");
      fetchAsset();
      fetchStatusHistory();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao alterar status."
      );
    } finally {
      setIsChangingStatus(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Carregando ativo...</span>
      </div>
    );
  }

  if (!asset) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/ativos")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {asset.code}
              </h2>
              <Badge
                variant="secondary"
                className={STATUS_COLORS[asset.status] || ""}
              >
                {STATUS_LABELS[asset.status] || asset.status}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">
              {asset.assetType?.name || "Ativo"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Alterar Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alterar Status do Ativo</DialogTitle>
                <DialogDescription>
                  Status atual:{" "}
                  <strong>
                    {STATUS_LABELS[asset.status] || asset.status}
                  </strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Novo Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o novo status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.filter(
                        (opt) => opt.value !== asset.status
                      ).map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Motivo</Label>
                  <Textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="Descreva o motivo da alteração..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setStatusDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleStatusChange}
                  disabled={!newStatus || isChangingStatus}
                >
                  {isChangingStatus ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Alterando...
                    </span>
                  ) : (
                    "Confirmar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={() => router.push(`/dashboard/ativos/${id}/editar`)}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Asset Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Informações do Ativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Hash className="w-4 h-4" />
                  Código
                </div>
                <p className="font-medium">{asset.code}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Package className="w-4 h-4" />
                  Tipo
                </div>
                <p className="font-medium">
                  {asset.assetType?.name || "—"}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  Número de Série
                </div>
                <p className="font-medium">{asset.serialNumber || "—"}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Factory className="w-4 h-4" />
                  Fabricante
                </div>
                <p className="font-medium">{asset.manufacturer || "—"}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Ano de Fabricação
                </div>
                <p className="font-medium">
                  {asset.manufacturingYear || "—"}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Ruler className="w-4 h-4" />
                  Dimensões (L x A x C)
                </div>
                <p className="font-medium">
                  {asset.width || asset.height || asset.length
                    ? `${asset.width || 0}m x ${asset.height || 0}m x ${asset.length || 0}m`
                    : "—"}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  Localização Atual
                </div>
                <p className="font-medium">
                  {asset.currentStockLocation
                    ? `${asset.currentStockLocation.name}${asset.currentStockLocation.customer ? ` (${asset.currentStockLocation.customer.razaoSocial})` : ""}`
                    : asset.currentLocation || "—"}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <DollarSign className="w-4 h-4" />
                  Valor Diário
                </div>
                <p className="font-medium text-green-700">
                  {formatCurrency(asset.dailyRate)}
                </p>
              </div>
            </div>

            {asset.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Observações</p>
                <p className="text-sm text-gray-700">{asset.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Status</p>
              <Badge
                variant="secondary"
                className={`text-sm ${STATUS_COLORS[asset.status] || ""}`}
              >
                {STATUS_LABELS[asset.status] || asset.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Condição</p>
              <p className="font-medium">
                {CONDITION_LABELS[asset.condition] || asset.condition}
              </p>
            </div>
            {asset.createdAt && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Cadastrado em</p>
                <p className="font-medium text-sm">
                  {formatDate(asset.createdAt)}
                </p>
              </div>
            )}
            {asset.updatedAt && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Última atualização</p>
                <p className="font-medium text-sm">
                  {formatDate(asset.updatedAt)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Status</CardTitle>
          <CardDescription>
            Registro de todas as alterações de status do ativo
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {statusHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <RefreshCw className="w-8 h-8 mb-2 text-gray-300" />
              <p className="text-sm">Nenhuma alteração de status registrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>De</TableHead>
                  <TableHead>Para</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Alterado por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm">
                      {formatDateTime(entry.changedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${STATUS_COLORS[entry.fromStatus] || ""}`}
                      >
                        {STATUS_LABELS[entry.fromStatus] || entry.fromStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${STATUS_COLORS[entry.toStatus] || ""}`}
                      >
                        {STATUS_LABELS[entry.toStatus] || entry.toStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">
                      {entry.reason || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {typeof entry.changedBy === "object"
                        ? entry.changedBy?.name
                        : entry.changedBy || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Maintenances with Add Dialog */}
      <MaintenanceSection assetId={id} maintenances={maintenances} onRefresh={fetchMaintenances} />

      {/* Historico de Movimentacao (por onde o container passou) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Histórico de Movimentação
          </CardTitle>
          <CardDescription>
            Por onde este container passou, com datas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {locationHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <MapPin className="w-8 h-8 mb-2 text-gray-300" />
              <p className="text-sm">Nenhuma movimentação registrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>De</TableHead>
                  <TableHead>Para</TableHead>
                  <TableHead>Obs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locationHistory.map((lh) => (
                  <TableRow key={lh.id}>
                    <TableCell className="text-sm">
                      {new Date(lh.movementDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {lh.movementType === "DELIVERY" ? "Entrega" : lh.movementType === "PICKUP" ? "Retirada" : lh.movementType === "SWAP" ? "Troca" : lh.movementType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {lh.fromLocation
                        ? `${lh.fromLocation.name}${lh.fromLocation.customer ? ` (${lh.fromLocation.customer.razaoSocial})` : ""}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {lh.toLocation.name}
                      {lh.toLocation.customer ? ` (${lh.toLocation.customer.razaoSocial})` : ""}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {lh.notes || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MaintenanceSection({ assetId, maintenances, onRefresh }: { assetId: string; maintenances: Maintenance[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: "CORRECTIVE", description: "", cost: "", startDate: "", endDate: "" });

  const MAINTENANCE_TYPE_LABELS: Record<string, string> = { PREVENTIVE: "Preventiva", CORRECTIVE: "Corretiva", INSPECTION: "Inspeção" };

  function formatCurrency(v: number | string) { const n = typeof v === "string" ? parseFloat(v) : v; if (isNaN(n)) return "R$ 0,00"; return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
  function formatDate(d: string) { try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return "—"; } }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description || !form.startDate) { toast.error("Descrição e data de início são obrigatórios"); return; }
    setSaving(true);
    try {
      const payload: any = { type: form.type, description: form.description, startDate: new Date(form.startDate).toISOString() };
      if (form.cost) payload.cost = parseFloat(form.cost);
      if (form.endDate) payload.endDate = new Date(form.endDate).toISOString();
      await api.post(`/assets/${assetId}/maintenances`, payload);
      toast.success("Manutenção registrada!"); setOpen(false); setForm({ type: "CORRECTIVE", description: "", cost: "", startDate: "", endDate: "" }); onRefresh();
    } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); } finally { setSaving(false); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="text-lg flex items-center gap-2"><Wrench className="w-5 h-5 text-blue-600" /> Manutenções</CardTitle><CardDescription>Registro de manutenções realizadas no ativo</CardDescription></div>
        <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Nova</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Nova Manutenção</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Tipo</Label><Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CORRECTIVE">Corretiva</SelectItem><SelectItem value="PREVENTIVE">Preventiva</SelectItem><SelectItem value="INSPECTION">Inspeção</SelectItem></SelectContent></Select></div>
              <div><Label>Descrição *</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Data Início *</Label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></div><div><Label>Data Fim</Label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div></div>
              <div><Label>Custo (R$)</Label><Input type="number" step="0.01" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} /></div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Registrar"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {maintenances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500"><Factory className="w-8 h-8 mb-2 text-gray-300" /><p className="text-sm">Nenhuma manutenção registrada</p></div>
        ) : (
          <Table><TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Custo</TableHead><TableHead>Data Início</TableHead><TableHead>Data Fim</TableHead></TableRow></TableHeader>
            <TableBody>{maintenances.map(m => (
              <TableRow key={m.id}><TableCell className="font-medium">{MAINTENANCE_TYPE_LABELS[m.type] || m.type}</TableCell><TableCell className="text-sm text-gray-600 max-w-[250px] truncate">{m.description || "—"}</TableCell><TableCell>{m.cost ? formatCurrency(m.cost) : "—"}</TableCell><TableCell className="text-sm">{formatDate(m.startDate)}</TableCell><TableCell className="text-sm">{m.endDate ? formatDate(m.endDate) : "Em andamento"}</TableCell></TableRow>
            ))}</TableBody></Table>
        )}
      </CardContent>
    </Card>
  );
}
