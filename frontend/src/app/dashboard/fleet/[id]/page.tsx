"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Edit, Trash2, Fuel, Wrench, ClipboardCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  AVAILABLE: { label: "Disponível", variant: "default" }, IN_OPERATION: { label: "Em Operação", variant: "secondary" }, IN_MAINTENANCE: { label: "Em Manutenção", variant: "destructive" }, DECOMMISSIONED: { label: "Desativado", variant: "outline" },
};

function formatDate(d: string) { try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return "—"; } }
function formatCurrency(v: number | string) { const n = typeof v === "string" ? parseFloat(v) : v; if (isNaN(n)) return "R$ 0,00"; return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

export default function VehicleDetailPage() {
  const router = useRouter(); const params = useParams();
  const [vehicle, setVehicle] = useState<any>(null); const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"info" | "fuel" | "maintenance" | "checklist">("info");

  // Fuel records
  const [fuelRecords, setFuelRecords] = useState<any[]>([]);
  const [fuelDialogOpen, setFuelDialogOpen] = useState(false);
  const [fuelForm, setFuelForm] = useState({ date: "", fuelType: "DIESEL", liters: "", pricePerLiter: "", totalCost: "", km: "", station: "" });
  const [savingFuel, setSavingFuel] = useState(false);

  // Maintenances
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [maintDialogOpen, setMaintDialogOpen] = useState(false);
  const [maintForm, setMaintForm] = useState({ type: "CORRECTIVE", description: "", cost: "", startDate: "", endDate: "", supplier: "" });
  const [savingMaint, setSavingMaint] = useState(false);

  // Checklists
  const [checklists, setChecklists] = useState<any[]>([]);
  const [checkDialogOpen, setCheckDialogOpen] = useState(false);
  const [checkForm, setCheckForm] = useState({ date: "", km: "", tires: "OK", brakes: "OK", lights: "OK", engine: "OK", bodywork: "OK", notes: "" });
  const [savingCheck, setSavingCheck] = useState(false);

  useEffect(() => { fetchVehicle(); }, []);
  useEffect(() => {
    if (tab === "fuel") fetchFuelRecords();
    if (tab === "maintenance") fetchMaintenances();
    if (tab === "checklist") fetchChecklists();
  }, [tab]);

  async function fetchVehicle() { try { const r = await api.get(`/vehicles/${params.id}`); setVehicle(r.data); setFuelRecords(r.data.fuelRecords || []); setMaintenances(r.data.maintenances || []); } catch { toast.error("Não encontrado"); router.push("/dashboard/fleet"); } finally { setLoading(false); } }
  async function fetchFuelRecords() { try { const r = await api.get(`/vehicles/${params.id}/fuel`); setFuelRecords(Array.isArray(r.data) ? r.data : r.data.data || []); } catch { toast.error("Erro ao carregar abastecimentos"); } }
  async function fetchMaintenances() { try { const r = await api.get(`/vehicles/${params.id}/maintenances`); setMaintenances(Array.isArray(r.data) ? r.data : r.data.data || []); } catch { toast.error("Erro ao carregar manutenções"); } }
  async function fetchChecklists() { try { const r = await api.get(`/vehicles/${params.id}/checklists`); setChecklists(Array.isArray(r.data) ? r.data : r.data.data || []); } catch { toast.error("Erro ao carregar checklists"); } }

  async function handleDelete() { try { await api.delete(`/vehicles/${params.id}`); toast.success("Excluído"); router.push("/dashboard/fleet"); } catch (e: any) { toast.error(e.response?.data?.message || "Erro"); } }

  async function handleAddFuel(e: React.FormEvent) {
    e.preventDefault();
    if (!fuelForm.date || !fuelForm.liters || !fuelForm.totalCost) { toast.error("Preencha data, litros e custo total"); return; }
    setSavingFuel(true);
    try {
      await api.post(`/vehicles/${params.id}/fuel`, { date: new Date(fuelForm.date).toISOString(), fuelType: fuelForm.fuelType, liters: parseFloat(fuelForm.liters), pricePerLiter: fuelForm.pricePerLiter ? parseFloat(fuelForm.pricePerLiter) : undefined, totalCost: parseFloat(fuelForm.totalCost), km: fuelForm.km ? parseInt(fuelForm.km) : undefined, station: fuelForm.station || undefined });
      toast.success("Abastecimento registrado!"); setFuelDialogOpen(false); setFuelForm({ date: "", fuelType: "DIESEL", liters: "", pricePerLiter: "", totalCost: "", km: "", station: "" }); fetchFuelRecords();
    } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); } finally { setSavingFuel(false); }
  }

  async function handleAddMaint(e: React.FormEvent) {
    e.preventDefault();
    if (!maintForm.description || !maintForm.startDate) { toast.error("Descrição e data de início obrigatórios"); return; }
    setSavingMaint(true);
    try {
      await api.post(`/vehicles/${params.id}/maintenances`, { type: maintForm.type, description: maintForm.description, cost: maintForm.cost ? parseFloat(maintForm.cost) : undefined, startDate: new Date(maintForm.startDate).toISOString(), endDate: maintForm.endDate ? new Date(maintForm.endDate).toISOString() : undefined, supplier: maintForm.supplier || undefined });
      toast.success("Manutenção registrada!"); setMaintDialogOpen(false); setMaintForm({ type: "CORRECTIVE", description: "", cost: "", startDate: "", endDate: "", supplier: "" }); fetchMaintenances();
    } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); } finally { setSavingMaint(false); }
  }

  async function handleAddChecklist(e: React.FormEvent) {
    e.preventDefault();
    if (!checkForm.date) { toast.error("Data obrigatória"); return; }
    setSavingCheck(true);
    try {
      await api.post(`/vehicles/${params.id}/checklists`, { date: new Date(checkForm.date).toISOString(), km: checkForm.km ? parseInt(checkForm.km) : undefined, items: { tires: checkForm.tires, brakes: checkForm.brakes, lights: checkForm.lights, engine: checkForm.engine, bodywork: checkForm.bodywork }, notes: checkForm.notes || undefined });
      toast.success("Checklist registrado!"); setCheckDialogOpen(false); setCheckForm({ date: "", km: "", tires: "OK", brakes: "OK", lights: "OK", engine: "OK", bodywork: "OK", notes: "" }); fetchChecklists();
    } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); } finally { setSavingCheck(false); }
  }

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  if (!vehicle) return null;

  const s = statusMap[vehicle.status] || { label: vehicle.status, variant: "outline" as const };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/fleet")}><ArrowLeft className="h-5 w-5" /></Button><div><h1 className="text-2xl font-bold font-mono">{vehicle.plate}</h1><p className="text-muted-foreground">{vehicle.type} {vehicle.brand ? `- ${vehicle.brand} ${vehicle.model || ""}` : ""}</p></div></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/fleet/${vehicle.id}/editar`)}><Edit className="mr-2 h-4 w-4" /> Editar</Button>
          <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Excluir {vehicle.plate}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {[{ key: "info", label: "Informações", icon: Edit }, { key: "fuel", label: "Abastecimentos", icon: Fuel }, { key: "maintenance", label: "Manutenções", icon: Wrench }, { key: "checklist", label: "Checklists", icon: ClipboardCheck }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Info Tab */}
      {tab === "info" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card><CardHeader><CardTitle>Informações</CardTitle></CardHeader><CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={s.variant}>{s.label}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><span>{vehicle.type}</span></div>
            {vehicle.brand && <div className="flex justify-between"><span className="text-muted-foreground">Marca/Modelo</span><span>{vehicle.brand} {vehicle.model}</span></div>}
            {vehicle.year && <div className="flex justify-between"><span className="text-muted-foreground">Ano</span><span>{vehicle.year}</span></div>}
            {vehicle.renavam && <div className="flex justify-between"><span className="text-muted-foreground">RENAVAM</span><span className="font-mono">{vehicle.renavam}</span></div>}
            {vehicle.loadCapacityKg && <div className="flex justify-between"><span className="text-muted-foreground">Capacidade</span><span>{Number(vehicle.loadCapacityKg).toLocaleString("pt-BR")} kg</span></div>}
            {vehicle.currentKm != null && <div className="flex justify-between"><span className="text-muted-foreground">KM Atual</span><span>{vehicle.currentKm.toLocaleString("pt-BR")} km</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Cadastrado em</span><span>{formatDate(vehicle.createdAt)}</span></div>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Resumo Rápido</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Abastecimentos</span><Badge variant="outline">{fuelRecords.length}</Badge></div>
            <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Manutenções</span><Badge variant="outline">{maintenances.length}</Badge></div>
            <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Motorista</span><span className="text-sm">{vehicle.driver?.name || "—"}</span></div>
          </CardContent></Card>
        </div>
      )}

      {/* Fuel Tab */}
      {tab === "fuel" && (
        <Card><CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle className="flex items-center gap-2"><Fuel className="w-5 h-5 text-blue-600" /> Abastecimentos</CardTitle><CardDescription>Registro de abastecimentos do veículo</CardDescription></div>
          <Dialog open={fuelDialogOpen} onOpenChange={setFuelDialogOpen}><DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Novo</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Novo Abastecimento</DialogTitle></DialogHeader>
              <form onSubmit={handleAddFuel} className="space-y-4">
                <div className="grid grid-cols-2 gap-4"><div><Label>Data *</Label><Input type="date" value={fuelForm.date} onChange={e => setFuelForm(p => ({ ...p, date: e.target.value }))} /></div><div><Label>Tipo Combustível</Label><Select value={fuelForm.fuelType} onValueChange={v => setFuelForm(p => ({ ...p, fuelType: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="DIESEL">Diesel</SelectItem><SelectItem value="GASOLINA">Gasolina</SelectItem><SelectItem value="ETANOL">Etanol</SelectItem><SelectItem value="GNV">GNV</SelectItem></SelectContent></Select></div></div>
                <div className="grid grid-cols-3 gap-4"><div><Label>Litros *</Label><Input type="number" step="0.01" value={fuelForm.liters} onChange={e => setFuelForm(p => ({ ...p, liters: e.target.value }))} /></div><div><Label>Preço/Litro</Label><Input type="number" step="0.01" value={fuelForm.pricePerLiter} onChange={e => setFuelForm(p => ({ ...p, pricePerLiter: e.target.value }))} /></div><div><Label>Custo Total *</Label><Input type="number" step="0.01" value={fuelForm.totalCost} onChange={e => setFuelForm(p => ({ ...p, totalCost: e.target.value }))} /></div></div>
                <div className="grid grid-cols-2 gap-4"><div><Label>KM</Label><Input type="number" value={fuelForm.km} onChange={e => setFuelForm(p => ({ ...p, km: e.target.value }))} /></div><div><Label>Posto</Label><Input value={fuelForm.station} onChange={e => setFuelForm(p => ({ ...p, station: e.target.value }))} /></div></div>
                <DialogFooter><Button type="button" variant="outline" onClick={() => setFuelDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={savingFuel}>{savingFuel ? "Salvando..." : "Registrar"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
          <CardContent className="p-0">{fuelRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500"><Fuel className="w-8 h-8 mb-2 text-gray-300" /><p className="text-sm">Nenhum abastecimento</p></div>
          ) : (
            <Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Combustível</TableHead><TableHead>Litros</TableHead><TableHead>Preço/L</TableHead><TableHead>Total</TableHead><TableHead>KM</TableHead><TableHead>Posto</TableHead></TableRow></TableHeader>
              <TableBody>{fuelRecords.map((fr: any) => (
                <TableRow key={fr.id}><TableCell className="text-sm">{formatDate(fr.date)}</TableCell><TableCell>{fr.fuelType || "—"}</TableCell><TableCell>{Number(fr.liters).toFixed(1)}L</TableCell><TableCell>{fr.pricePerLiter ? formatCurrency(fr.pricePerLiter) : "—"}</TableCell><TableCell className="font-medium">{formatCurrency(fr.totalCost)}</TableCell><TableCell>{fr.km ? `${Number(fr.km).toLocaleString("pt-BR")} km` : "—"}</TableCell><TableCell>{fr.station || "—"}</TableCell></TableRow>
              ))}</TableBody></Table>
          )}</CardContent>
        </Card>
      )}

      {/* Maintenance Tab */}
      {tab === "maintenance" && (
        <Card><CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle className="flex items-center gap-2"><Wrench className="w-5 h-5 text-blue-600" /> Manutenções</CardTitle><CardDescription>Registro de manutenções</CardDescription></div>
          <Dialog open={maintDialogOpen} onOpenChange={setMaintDialogOpen}><DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Nova</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Nova Manutenção</DialogTitle></DialogHeader>
              <form onSubmit={handleAddMaint} className="space-y-4">
                <div><Label>Tipo</Label><Select value={maintForm.type} onValueChange={v => setMaintForm(p => ({ ...p, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CORRECTIVE">Corretiva</SelectItem><SelectItem value="PREVENTIVE">Preventiva</SelectItem><SelectItem value="INSPECTION">Inspeção</SelectItem></SelectContent></Select></div>
                <div><Label>Descrição *</Label><Textarea value={maintForm.description} onChange={e => setMaintForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
                <div className="grid grid-cols-2 gap-4"><div><Label>Data Início *</Label><Input type="date" value={maintForm.startDate} onChange={e => setMaintForm(p => ({ ...p, startDate: e.target.value }))} /></div><div><Label>Data Fim</Label><Input type="date" value={maintForm.endDate} onChange={e => setMaintForm(p => ({ ...p, endDate: e.target.value }))} /></div></div>
                <div className="grid grid-cols-2 gap-4"><div><Label>Custo (R$)</Label><Input type="number" step="0.01" value={maintForm.cost} onChange={e => setMaintForm(p => ({ ...p, cost: e.target.value }))} /></div><div><Label>Fornecedor</Label><Input value={maintForm.supplier} onChange={e => setMaintForm(p => ({ ...p, supplier: e.target.value }))} /></div></div>
                <DialogFooter><Button type="button" variant="outline" onClick={() => setMaintDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={savingMaint}>{savingMaint ? "Salvando..." : "Registrar"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
          <CardContent className="p-0">{maintenances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500"><Wrench className="w-8 h-8 mb-2 text-gray-300" /><p className="text-sm">Nenhuma manutenção</p></div>
          ) : (
            <Table><TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Custo</TableHead><TableHead>Início</TableHead><TableHead>Fim</TableHead><TableHead>Fornecedor</TableHead></TableRow></TableHeader>
              <TableBody>{maintenances.map((m: any) => (
                <TableRow key={m.id}><TableCell><Badge variant="outline">{m.type === "CORRECTIVE" ? "Corretiva" : m.type === "PREVENTIVE" ? "Preventiva" : "Inspeção"}</Badge></TableCell><TableCell className="max-w-[200px] truncate">{m.description}</TableCell><TableCell>{m.cost ? formatCurrency(m.cost) : "—"}</TableCell><TableCell className="text-sm">{formatDate(m.startDate)}</TableCell><TableCell className="text-sm">{m.endDate ? formatDate(m.endDate) : "Em andamento"}</TableCell><TableCell>{m.supplier || "—"}</TableCell></TableRow>
              ))}</TableBody></Table>
          )}</CardContent>
        </Card>
      )}

      {/* Checklist Tab */}
      {tab === "checklist" && (
        <Card><CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle className="flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-blue-600" /> Checklists</CardTitle><CardDescription>Inspeções de checklist do veículo</CardDescription></div>
          <Dialog open={checkDialogOpen} onOpenChange={setCheckDialogOpen}><DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Novo</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Novo Checklist</DialogTitle></DialogHeader>
              <form onSubmit={handleAddChecklist} className="space-y-4">
                <div className="grid grid-cols-2 gap-4"><div><Label>Data *</Label><Input type="date" value={checkForm.date} onChange={e => setCheckForm(p => ({ ...p, date: e.target.value }))} /></div><div><Label>KM</Label><Input type="number" value={checkForm.km} onChange={e => setCheckForm(p => ({ ...p, km: e.target.value }))} /></div></div>
                {["tires", "brakes", "lights", "engine", "bodywork"].map(item => {
                  const labels: Record<string, string> = { tires: "Pneus", brakes: "Freios", lights: "Luzes", engine: "Motor", bodywork: "Carroceria" };
                  return (<div key={item} className="flex items-center justify-between"><Label>{labels[item]}</Label><Select value={(checkForm as any)[item]} onValueChange={v => setCheckForm(p => ({ ...p, [item]: v }))}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="OK">OK</SelectItem><SelectItem value="ATENCAO">Atenção</SelectItem><SelectItem value="CRITICO">Crítico</SelectItem></SelectContent></Select></div>);
                })}
                <div><Label>Observações</Label><Textarea value={checkForm.notes} onChange={e => setCheckForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
                <DialogFooter><Button type="button" variant="outline" onClick={() => setCheckDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={savingCheck}>{savingCheck ? "Salvando..." : "Registrar"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
          <CardContent className="p-0">{checklists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500"><ClipboardCheck className="w-8 h-8 mb-2 text-gray-300" /><p className="text-sm">Nenhum checklist</p></div>
          ) : (
            <Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>KM</TableHead><TableHead>Pneus</TableHead><TableHead>Freios</TableHead><TableHead>Luzes</TableHead><TableHead>Motor</TableHead><TableHead>Carroceria</TableHead><TableHead>Obs</TableHead></TableRow></TableHeader>
              <TableBody>{checklists.map((c: any) => {
                const items = c.items || {};
                const badgeV = (v: string) => v === "OK" ? "default" : v === "ATENCAO" ? "secondary" : "destructive";
                return (<TableRow key={c.id}><TableCell className="text-sm">{formatDate(c.date)}</TableCell><TableCell>{c.km ? `${Number(c.km).toLocaleString("pt-BR")}` : "—"}</TableCell>
                  <TableCell><Badge variant={badgeV(items.tires || "OK")}>{items.tires || "OK"}</Badge></TableCell><TableCell><Badge variant={badgeV(items.brakes || "OK")}>{items.brakes || "OK"}</Badge></TableCell>
                  <TableCell><Badge variant={badgeV(items.lights || "OK")}>{items.lights || "OK"}</Badge></TableCell><TableCell><Badge variant={badgeV(items.engine || "OK")}>{items.engine || "OK"}</Badge></TableCell>
                  <TableCell><Badge variant={badgeV(items.bodywork || "OK")}>{items.bodywork || "OK"}</Badge></TableCell><TableCell className="text-sm max-w-[150px] truncate">{c.notes || "—"}</TableCell>
                </TableRow>);
              })}</TableBody></Table>
          )}</CardContent>
        </Card>
      )}
    </div>
  );
}
