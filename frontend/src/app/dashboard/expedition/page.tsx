"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Loader2, Truck, Ban, ExternalLink, Calendar, Pencil } from "lucide-react";
import { toast } from "sonner";

interface ExpeditionItem {
  id: string;
  contractId: string;
  contractNumber: string;
  customer: string;
  assetCode: string;
  assetType: string;
  scheduledDeliveryDate: string;
  deliveryBlockedReason: string | null;
  isBlocked: boolean;
  contractSignedAt: string | null;
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return "—"; }
}

export default function ExpeditionPage() {
  const [items, setItems] = useState<ExpeditionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExpeditionItem | null>(null);
  const [editForm, setEditForm] = useState({ scheduledDeliveryDate: "", deliveryBlockedReason: "" });
  const [saving, setSaving] = useState(false);
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);

  const fetchExpedition = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (start) params.set("start", start);
      if (end) params.set("end", end);
      const { data } = await api.get(`/dashboard/expedition?${params}`);
      setItems(Array.isArray(data) ? data : data?.items || []);
      setServiceOrders(data?.serviceOrders || []);
    } catch {
      toast.error("Erro ao carregar painel de expedição.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const defaultStart = now.toISOString().slice(0, 10);
    const defaultEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const s = start || defaultStart;
    const e = end || defaultEnd;
    if (!start) setStart(s);
    if (!end) setEnd(e);
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("start", s);
        params.set("end", e);
        const { data } = await api.get(`/dashboard/expedition?${params}`);
        setItems(Array.isArray(data) ? data : data?.items || []);
        setServiceOrders(data?.serviceOrders || []);
      } catch {
        toast.error("Erro ao carregar painel de expedição.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  function openEdit(item: ExpeditionItem) {
    setEditItem(item);
    setEditForm({
      scheduledDeliveryDate: item.scheduledDeliveryDate ? item.scheduledDeliveryDate.slice(0, 10) : "",
      deliveryBlockedReason: item.deliveryBlockedReason || "",
    });
    setEditOpen(true);
  }
  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem) return;
    setSaving(true);
    try {
      await api.patch(`/contracts/${editItem.contractId}/items/${editItem.id}/delivery`, {
        scheduledDeliveryDate: editForm.scheduledDeliveryDate ? new Date(editForm.scheduledDeliveryDate).toISOString() : undefined,
        deliveryBlockedReason: editForm.deliveryBlockedReason || null,
      });
      toast.success("Atualizado!");
      setEditOpen(false);
      setEditItem(null);
      fetchExpedition();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    } finally {
      setSaving(false);
    }
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Carregando...</span>
      </div>
    );
  }

  const blockedCount = items.filter((i) => i.isBlocked).length;
  const releasedCount = items.length - blockedCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel de Expedição</h1>
        <p className="text-gray-500 mt-1">
          Entregas programadas e status de bloqueio
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Filtro de Período
            </CardTitle>
            <CardDescription>
              Defina o intervalo de datas para visualizar entregas programadas
            </CardDescription>
          </div>
          <div className="flex gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Início</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fim</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-40" />
            </div>
            <Button variant="outline" size="sm" onClick={fetchExpedition}>
              Atualizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Itens</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Bloqueados</p>
                <p className="text-2xl font-bold">{blockedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Liberados</p>
                <p className="text-2xl font-bold">{releasedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entregas Programadas</CardTitle>
          <CardDescription>
            Itens com data de entrega definida no período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Package className="w-10 h-10 mb-2 text-gray-300" />
              <p>Nenhum item com entrega programada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assinado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {formatDate(row.scheduledDeliveryDate)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/contracts/${row.contractId}`}
                        className="text-blue-600 hover:underline font-mono"
                      >
                        {row.contractNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{row.customer}</TableCell>
                    <TableCell className="font-mono">{row.assetCode || "—"}</TableCell>
                    <TableCell>{row.assetType || "—"}</TableCell>
                    <TableCell>
                      {row.isBlocked ? (
                        <Badge variant="destructive" className="gap-1">
                          <Ban className="w-3 h-3" />
                          {row.deliveryBlockedReason === "PAGAMENTO_PENDENTE"
                            ? "Pagamento"
                            : row.deliveryBlockedReason === "CONTRATO_NAO_ASSINADO"
                            ? "Contrato"
                            : row.deliveryBlockedReason || "Bloqueado"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Liberado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.contractSignedAt ? (
                        <Badge variant="outline" className="text-green-700">
                          Sim
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-700">
                          Não
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(row)} title="Agendar/Editar"><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/contracts/${row.contractId}`} title="Ver contrato"><ExternalLink className="w-4 h-4" /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {serviceOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ordens de Serviço</CardTitle>
            <CardDescription>OS agendadas no período</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Nº</TableHead><TableHead>Tipo</TableHead><TableHead>Contrato</TableHead><TableHead>Cliente</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {serviceOrders.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono font-medium">{o.orderNumber}</TableCell>
                    <TableCell><Badge variant="outline">{o.type}</Badge></TableCell>
                    <TableCell><Link href={`/dashboard/contracts/${o.contractId}`} className="text-blue-600 hover:underline">{o.contract?.contractNumber}</Link></TableCell>
                    <TableCell>{o.contract?.customer?.razaoSocial || o.contract?.customer?.nomeFantasia || "—"}</TableCell>
                    <TableCell className="text-sm">{o.scheduledDate ? formatDate(o.scheduledDate) : "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{o.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent><DialogHeader><DialogTitle>Agendar / Bloquear Entrega</DialogTitle></DialogHeader>
          {editItem && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <p className="text-sm text-gray-500">Contrato {editItem.contractNumber} — {editItem.assetCode}</p>
              <div><Label>Data programada</Label><Input type="date" value={editForm.scheduledDeliveryDate} onChange={e => setEditForm(p => ({ ...p, scheduledDeliveryDate: e.target.value }))} /></div>
              <div><Label>Motivo bloqueio</Label><Select value={editForm.deliveryBlockedReason || "none"} onValueChange={v => setEditForm(p => ({ ...p, deliveryBlockedReason: v === "none" ? "" : v }))}><SelectTrigger><SelectValue placeholder="Liberado" /></SelectTrigger><SelectContent><SelectItem value="none">Liberado</SelectItem><SelectItem value="PAGAMENTO_PENDENTE">Pagamento pendente</SelectItem><SelectItem value="CONTRATO_NAO_ASSINADO">Contrato não assinado</SelectItem></SelectContent></Select></div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
