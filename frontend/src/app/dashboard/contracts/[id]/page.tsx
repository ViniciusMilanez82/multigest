"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Pencil, RefreshCw, Loader2, FileText, Users, Calendar, DollarSign, Package, Truck, ClipboardList, FilePlus2, Plus } from "lucide-react";
import { toast } from "sonner";

interface ContractItem { id: string; assetId: string; dailyRate: number | string; monthlyRate?: number | string; startDate: string; endDate?: string; departureDate?: string; isActive: boolean; notes?: string; asset?: { id: string; code: string; status: string; assetType?: { name: string } }; }
interface Contract { id: string; contractNumber: string; type: string; status: string; startDate: string; endDate?: string; paymentTerms?: string; paymentMethod?: string; totalMonthlyValue?: number | string; notes?: string; createdAt?: string; updatedAt?: string; customer?: { id: string; razaoSocial: string; nomeFantasia?: string; cpfCnpj: string }; items?: ContractItem[]; movements?: { id: string; type: string; assetCode?: string; movementDate: string; address?: string; notes?: string }[]; }
interface Measurement { id: string; referenceMonth: string; status: string; totalValue: number | string; notes?: string; items?: MeasurementItem[]; createdAt: string; }
interface MeasurementItem { id: string; contractItemId: string; billedDays: number; excludedDays: number; excludedReason?: string; unitValue: number | string; totalValue: number | string; }
interface Addendum { id: string; type: string; description: string; effectiveDate: string; newValue?: number | string; notes?: string; createdAt: string; }

const STATUS_LABELS: Record<string, string> = { DRAFT: "Rascunho", ACTIVE: "Ativo", SUSPENDED: "Suspenso", TERMINATED: "Encerrado", CANCELLED: "Cancelado" };
const STATUS_COLORS: Record<string, string> = { DRAFT: "bg-gray-100 text-gray-800", ACTIVE: "bg-green-100 text-green-800", SUSPENDED: "bg-yellow-100 text-yellow-800", TERMINATED: "bg-red-100 text-red-800", CANCELLED: "bg-red-100 text-red-600" };
const STATUS_OPTIONS = [ { value: "DRAFT", label: "Rascunho" }, { value: "ACTIVE", label: "Ativo" }, { value: "SUSPENDED", label: "Suspenso" }, { value: "TERMINATED", label: "Encerrado" }, { value: "CANCELLED", label: "Cancelado" } ];
const MOVEMENT_LABELS: Record<string, string> = { DELIVERY: "Entrega", PICKUP: "Retirada", SWAP: "Troca" };
const MEASUREMENT_STATUS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = { PENDING: { label: "Pendente", variant: "outline" }, APPROVED: { label: "Aprovada", variant: "default" }, INVOICED: { label: "Faturada", variant: "secondary" } };
const ADDENDUM_TYPES: Record<string, string> = { VALUE_CHANGE: "Alteração de Valor", ITEM_ADDITION: "Adição de Item", ITEM_REMOVAL: "Remoção de Item", PERIOD_EXTENSION: "Prorrogação", OTHER: "Outro" };

function formatDate(d: string) { try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return "—"; } }
function formatCurrency(v: number | string | undefined) { if (!v) return "R$ 0,00"; const n = typeof v === "string" ? parseFloat(v) : v; if (isNaN(n)) return "R$ 0,00"; return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

export default function ContratoDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"items" | "movements" | "measurements" | "addendums">("items");

  // Status dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Measurements
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loadingMeas, setLoadingMeas] = useState(false);
  const [measDialogOpen, setMeasDialogOpen] = useState(false);
  const [measForm, setMeasForm] = useState({ referenceMonth: "", notes: "" });
  const [savingMeas, setSavingMeas] = useState(false);

  // Movements
  const [movDialogOpen, setMovDialogOpen] = useState(false);
  const [movForm, setMovForm] = useState({ type: "DELIVERY", assetCode: "", movementDate: "", address: "", notes: "" });
  const [savingMov, setSavingMov] = useState(false);

  // Addendums
  const [addendums, setAddendums] = useState<Addendum[]>([]);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({ type: "VALUE_CHANGE", description: "", effectiveDate: "", newValue: "", notes: "" });
  const [savingAdd, setSavingAdd] = useState(false);

  const fetchContract = useCallback(async () => {
    setIsLoading(true);
    try { const { data } = await api.get(`/contracts/${id}`); setContract(data); } catch { toast.error("Erro ao carregar contrato."); router.push("/dashboard/contracts"); } finally { setIsLoading(false); }
  }, [id, router]);

  const fetchMeasurements = useCallback(async () => {
    setLoadingMeas(true);
    try { const { data } = await api.get(`/contracts/${id}/measurements`); setMeasurements(Array.isArray(data) ? data : data.data || []); } catch { toast.error("Erro ao carregar medições"); } finally { setLoadingMeas(false); }
  }, [id]);

  const fetchAddendums = useCallback(async () => {
    setLoadingAdd(true);
    try { const { data } = await api.get(`/contracts/${id}/addendums`); setAddendums(Array.isArray(data) ? data : data.data || []); } catch { toast.error("Erro ao carregar aditivos"); } finally { setLoadingAdd(false); }
  }, [id]);

  useEffect(() => { fetchContract(); }, [fetchContract]);
  useEffect(() => { if (tab === "measurements") fetchMeasurements(); }, [tab, fetchMeasurements]);
  useEffect(() => { if (tab === "addendums") fetchAddendums(); }, [tab, fetchAddendums]);

  async function handleStatusChange() {
    if (!newStatus) return;
    setIsChangingStatus(true);
    try { await api.patch(`/contracts/${id}/status`, { status: newStatus, reason: statusReason || undefined }); toast.success("Status alterado!"); setStatusDialogOpen(false); setNewStatus(""); setStatusReason(""); fetchContract(); } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); } finally { setIsChangingStatus(false); }
  }

  async function handleCreateMeasurement(e: React.FormEvent) {
    e.preventDefault();
    if (!measForm.referenceMonth) { toast.error("Mês de referência é obrigatório"); return; }
    setSavingMeas(true);
    try { await api.post(`/contracts/${id}/measurements`, { referenceMonth: measForm.referenceMonth, notes: measForm.notes || undefined }); toast.success("Medição criada!"); setMeasDialogOpen(false); setMeasForm({ referenceMonth: "", notes: "" }); fetchMeasurements(); } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); } finally { setSavingMeas(false); }
  }

  async function handleApproveMeasurement(measId: string) {
    try { await api.patch(`/contracts/${id}/measurements/${measId}/approve`); toast.success("Medição aprovada!"); fetchMeasurements(); } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); }
  }

  async function handleCreateMovement(e: React.FormEvent) {
    e.preventDefault();
    if (!movForm.type || !movForm.movementDate) { toast.error("Tipo e data são obrigatórios"); return; }
    setSavingMov(true);
    try { await api.post(`/contracts/${id}/movements`, { type: movForm.type, assetCode: movForm.assetCode || undefined, movementDate: new Date(movForm.movementDate).toISOString(), address: movForm.address || undefined, notes: movForm.notes || undefined }); toast.success("Movimentação registrada!"); setMovDialogOpen(false); setMovForm({ type: "DELIVERY", assetCode: "", movementDate: "", address: "", notes: "" }); fetchContract(); } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); } finally { setSavingMov(false); }
  }

  async function handleCreateAddendum(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.description || !addForm.effectiveDate) { toast.error("Descrição e data são obrigatórios"); return; }
    setSavingAdd(true);
    try { await api.post(`/contracts/${id}/addendums`, { type: addForm.type, description: addForm.description, effectiveDate: new Date(addForm.effectiveDate).toISOString(), newValue: addForm.newValue ? parseFloat(addForm.newValue) : undefined, notes: addForm.notes || undefined }); toast.success("Aditivo criado!"); setAddDialogOpen(false); setAddForm({ type: "VALUE_CHANGE", description: "", effectiveDate: "", newValue: "", notes: "" }); fetchAddendums(); } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); } finally { setSavingAdd(false); }
  }

  if (isLoading) return (<div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /><span className="ml-2 text-gray-500">Carregando contrato...</span></div>);
  if (!contract) return null;
  const activeItems = contract.items?.filter(i => i.isActive) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/contracts")}><ArrowLeft className="w-4 h-4 mr-1" /> Voltar</Button>
          <div>
            <div className="flex items-center gap-3"><h2 className="text-2xl font-bold text-gray-900">{contract.contractNumber}</h2><Badge variant="secondary" className={STATUS_COLORS[contract.status] || ""}>{STATUS_LABELS[contract.status] || contract.status}</Badge></div>
            <p className="text-gray-500 mt-1">{contract.customer?.razaoSocial}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}><DialogTrigger asChild><Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" /> Alterar Status</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Alterar Status</DialogTitle><DialogDescription>Status atual: <strong>{STATUS_LABELS[contract.status] || contract.status}</strong></DialogDescription></DialogHeader>
              <div className="space-y-4 py-2"><div className="space-y-2"><Label>Novo Status</Label><Select value={newStatus} onValueChange={setNewStatus}><SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{STATUS_OPTIONS.filter(opt => opt.value !== contract.status).map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label>Motivo</Label><Textarea value={statusReason} onChange={e => setStatusReason(e.target.value)} placeholder="Descreva..." rows={3} /></div></div>
              <DialogFooter><Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancelar</Button><Button onClick={handleStatusChange} disabled={!newStatus || isChangingStatus}>{isChangingStatus ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Confirmar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={() => router.push(`/dashboard/contracts/${id}/editar`)}><Pencil className="w-4 h-4 mr-2" /> Editar</Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2"><CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> Dados do Contrato</CardTitle></CardHeader><CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1"><div className="flex items-center gap-2 text-sm text-gray-500"><FileText className="w-4 h-4" /> Nº Contrato (Centro de Custo)</div><p className="font-medium font-mono">{contract.contractNumber}</p></div>
            <div className="space-y-1"><div className="text-sm text-gray-500">Tipo de Contrato</div><Badge variant="outline">{contract.type === "MEDICAO" ? "Medição" : contract.type === "ANTECIPADO" ? "Antecipado" : contract.type === "AUTOMATICO" ? "Automático" : contract.type || "Medição"}</Badge></div>
            <div className="space-y-1"><div className="flex items-center gap-2 text-sm text-gray-500"><Users className="w-4 h-4" /> Cliente (chave: CNPJ)</div><p className="font-medium">{contract.customer?.razaoSocial}</p>{contract.customer?.nomeFantasia && <p className="text-xs text-gray-500">{contract.customer.nomeFantasia}</p>}<p className="text-xs text-gray-400 font-mono">{contract.customer?.cpfCnpj}</p></div>
            <div className="space-y-1"><div className="flex items-center gap-2 text-sm text-gray-500"><Calendar className="w-4 h-4" /> Período</div><p className="font-medium">{formatDate(contract.startDate)}{contract.endDate ? ` até ${formatDate(contract.endDate)}` : " — Indeterminado"}</p></div>
            <div className="space-y-1"><div className="flex items-center gap-2 text-sm text-gray-500"><DollarSign className="w-4 h-4" /> Forma de Pagamento</div><p className="font-medium">{contract.paymentMethod || "—"}</p></div>
            {contract.paymentTerms && <div className="space-y-1"><p className="text-sm text-gray-500">Condições</p><p className="font-medium">{contract.paymentTerms}</p></div>}
          </div>
          {contract.notes && <div className="mt-4 pt-4 border-t"><p className="text-sm text-gray-500 mb-1">Observações</p><p className="text-sm text-gray-700">{contract.notes}</p></div>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Resumo</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="space-y-2"><p className="text-sm text-gray-500">Status</p><Badge variant="secondary" className={`text-sm ${STATUS_COLORS[contract.status] || ""}`}>{STATUS_LABELS[contract.status] || contract.status}</Badge></div>
          <div className="space-y-2"><p className="text-sm text-gray-500">Itens Ativos</p><p className="text-2xl font-bold">{activeItems.length}</p></div>
          <div className="space-y-2"><p className="text-sm text-gray-500">Valor Mensal</p><p className="text-xl font-bold text-green-700">{formatCurrency(contract.totalMonthlyValue)}</p></div>
          {contract.createdAt && <div className="space-y-2"><p className="text-sm text-gray-500">Criado em</p><p className="font-medium text-sm">{formatDate(contract.createdAt)}</p></div>}
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {[{ key: "items", label: "Itens", icon: Package }, { key: "movements", label: "Movimentações", icon: Truck }, { key: "measurements", label: "Medições", icon: ClipboardList }, { key: "addendums", label: "Aditivos", icon: FilePlus2 }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Items */}
      {tab === "items" && (
        <Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Package className="w-5 h-5 text-blue-600" /> Itens do Contrato</CardTitle><CardDescription>Ativos incluídos neste contrato</CardDescription></CardHeader>
          <CardContent className="p-0">{!contract.items || contract.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500"><Package className="w-8 h-8 mb-2 text-gray-300" /><p className="text-sm">Nenhum item</p></div>
          ) : (
            <Table><TableHeader><TableRow><TableHead>Ativo</TableHead><TableHead>Tipo</TableHead><TableHead>Diária</TableHead><TableHead>Mensal</TableHead><TableHead>Início</TableHead><TableHead>Saída</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{contract.items.map(item => (
                <TableRow key={item.id} className={!item.isActive ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{item.asset?.code || "—"}</TableCell><TableCell>{item.asset?.assetType?.name || "—"}</TableCell>
                  <TableCell>{formatCurrency(item.dailyRate)}</TableCell><TableCell>{formatCurrency(item.monthlyRate)}</TableCell>
                  <TableCell className="text-sm">{formatDate(item.startDate)}</TableCell><TableCell className="text-sm">{item.departureDate ? formatDate(item.departureDate) : "—"}</TableCell>
                  <TableCell><Badge variant="secondary" className={item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>{item.isActive ? "Ativo" : "Removido"}</Badge></TableCell>
                </TableRow>))}</TableBody>
            </Table>
          )}</CardContent>
        </Card>
      )}

      {/* TAB: Movements */}
      {tab === "movements" && (
        <Card><CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle className="text-lg flex items-center gap-2"><Truck className="w-5 h-5 text-blue-600" /> Movimentações</CardTitle><CardDescription>Entregas, retiradas e trocas</CardDescription></div>
          <Dialog open={movDialogOpen} onOpenChange={setMovDialogOpen}><DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Nova</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Nova Movimentação</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateMovement} className="space-y-4">
                <div><Label>Tipo *</Label><Select value={movForm.type} onValueChange={v => setMovForm(p => ({ ...p, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="DELIVERY">Entrega</SelectItem><SelectItem value="PICKUP">Retirada</SelectItem><SelectItem value="SWAP">Troca</SelectItem></SelectContent></Select></div>
                <div><Label>Código do Ativo</Label><Input value={movForm.assetCode} onChange={e => setMovForm(p => ({ ...p, assetCode: e.target.value }))} placeholder="CTN-001" /></div>
                <div><Label>Data *</Label><Input type="date" value={movForm.movementDate} onChange={e => setMovForm(p => ({ ...p, movementDate: e.target.value }))} /></div>
                <div><Label>Endereço</Label><Input value={movForm.address} onChange={e => setMovForm(p => ({ ...p, address: e.target.value }))} /></div>
                <div><Label>Observações</Label><Textarea value={movForm.notes} onChange={e => setMovForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
                <DialogFooter><Button type="button" variant="outline" onClick={() => setMovDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={savingMov}>{savingMov ? "Salvando..." : "Registrar"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
          <CardContent className="p-0">{!contract.movements || contract.movements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500"><Truck className="w-8 h-8 mb-2 text-gray-300" /><p className="text-sm">Nenhuma movimentação</p></div>
          ) : (
            <Table><TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Ativo</TableHead><TableHead>Data</TableHead><TableHead>Endereço</TableHead><TableHead>Obs</TableHead></TableRow></TableHeader>
              <TableBody>{contract.movements.map(mov => (
                <TableRow key={mov.id}><TableCell><Badge variant="secondary">{MOVEMENT_LABELS[mov.type] || mov.type}</Badge></TableCell><TableCell>{mov.assetCode || "—"}</TableCell><TableCell className="text-sm">{formatDate(mov.movementDate)}</TableCell><TableCell className="text-sm max-w-[200px] truncate">{mov.address || "—"}</TableCell><TableCell className="text-sm max-w-[150px] truncate">{mov.notes || "—"}</TableCell></TableRow>
              ))}</TableBody>
            </Table>
          )}</CardContent>
        </Card>
      )}

      {/* TAB: Measurements */}
      {tab === "measurements" && (
        <Card><CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle className="text-lg flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-600" /> Medições</CardTitle><CardDescription>Medições mensais do contrato</CardDescription></div>
          <Dialog open={measDialogOpen} onOpenChange={setMeasDialogOpen}><DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Nova Medição</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Nova Medição</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateMeasurement} className="space-y-4">
                <div><Label>Mês de Referência *</Label><Input type="month" value={measForm.referenceMonth} onChange={e => setMeasForm(p => ({ ...p, referenceMonth: e.target.value }))} /></div>
                <div><Label>Observações</Label><Textarea value={measForm.notes} onChange={e => setMeasForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
                <DialogFooter><Button type="button" variant="outline" onClick={() => setMeasDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={savingMeas}>{savingMeas ? "Salvando..." : "Criar"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
          <CardContent className="p-0">{loadingMeas ? <div className="text-center py-8 text-muted-foreground">Carregando...</div> : measurements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500"><ClipboardList className="w-8 h-8 mb-2 text-gray-300" /><p className="text-sm">Nenhuma medição</p></div>
          ) : (
            <Table><TableHeader><TableRow><TableHead>Referência</TableHead><TableHead>Status</TableHead><TableHead>Valor Total</TableHead><TableHead>Criado em</TableHead><TableHead>Obs</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
              <TableBody>{measurements.map(m => {
                const s = MEASUREMENT_STATUS[m.status] || { label: m.status, variant: "outline" as const };
                return (<TableRow key={m.id}>
                  <TableCell className="font-medium">{m.referenceMonth}</TableCell><TableCell><Badge variant={s.variant}>{s.label}</Badge></TableCell><TableCell>{formatCurrency(m.totalValue)}</TableCell>
                  <TableCell className="text-sm">{formatDate(m.createdAt)}</TableCell><TableCell className="text-sm max-w-[150px] truncate">{m.notes || "—"}</TableCell>
                  <TableCell>{m.status === "PENDING" && <Button size="sm" variant="outline" onClick={() => handleApproveMeasurement(m.id)}>Aprovar</Button>}</TableCell>
                </TableRow>);
              })}</TableBody>
            </Table>
          )}</CardContent>
        </Card>
      )}

      {/* TAB: Addendums */}
      {tab === "addendums" && (
        <Card><CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle className="text-lg flex items-center gap-2"><FilePlus2 className="w-5 h-5 text-blue-600" /> Aditivos</CardTitle><CardDescription>Alterações contratuais</CardDescription></div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}><DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Novo Aditivo</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Novo Aditivo</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateAddendum} className="space-y-4">
                <div><Label>Tipo</Label><Select value={addForm.type} onValueChange={v => setAddForm(p => ({ ...p, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="VALUE_CHANGE">Alteração de Valor</SelectItem><SelectItem value="ITEM_ADDITION">Adição de Item</SelectItem><SelectItem value="ITEM_REMOVAL">Remoção de Item</SelectItem><SelectItem value="PERIOD_EXTENSION">Prorrogação</SelectItem><SelectItem value="OTHER">Outro</SelectItem></SelectContent></Select></div>
                <div><Label>Descrição *</Label><Textarea value={addForm.description} onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
                <div><Label>Data de Vigência *</Label><Input type="date" value={addForm.effectiveDate} onChange={e => setAddForm(p => ({ ...p, effectiveDate: e.target.value }))} /></div>
                <div><Label>Novo Valor (R$)</Label><Input type="number" step="0.01" value={addForm.newValue} onChange={e => setAddForm(p => ({ ...p, newValue: e.target.value }))} /></div>
                <div><Label>Observações</Label><Textarea value={addForm.notes} onChange={e => setAddForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
                <DialogFooter><Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={savingAdd}>{savingAdd ? "Salvando..." : "Criar"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
          <CardContent className="p-0">{loadingAdd ? <div className="text-center py-8 text-muted-foreground">Carregando...</div> : addendums.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500"><FilePlus2 className="w-8 h-8 mb-2 text-gray-300" /><p className="text-sm">Nenhum aditivo</p></div>
          ) : (
            <Table><TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Data Vigência</TableHead><TableHead>Novo Valor</TableHead><TableHead>Obs</TableHead></TableRow></TableHeader>
              <TableBody>{addendums.map(a => (
                <TableRow key={a.id}>
                  <TableCell><Badge variant="outline">{ADDENDUM_TYPES[a.type] || a.type}</Badge></TableCell><TableCell className="max-w-[250px]">{a.description}</TableCell><TableCell className="text-sm">{formatDate(a.effectiveDate)}</TableCell>
                  <TableCell>{a.newValue ? formatCurrency(a.newValue) : "—"}</TableCell><TableCell className="text-sm max-w-[150px] truncate">{a.notes || "—"}</TableCell>
                </TableRow>))}</TableBody>
            </Table>
          )}</CardContent>
        </Card>
      )}
    </div>
  );
}
