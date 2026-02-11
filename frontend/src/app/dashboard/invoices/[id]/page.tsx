"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit, DollarSign, Plus, AlertTriangle, Handshake, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: string;
  notes: string | null;
  customer: { id: string; razaoSocial: string; nomeFantasia: string | null; cpfCnpj: string };
  contract: { id: string; contractNumber: string; type?: string } | null;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
  payments: any[];
  items: any[];
  collectionActions: any[];
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  OPEN: { label: "Em Aberto", variant: "default" },
  PAID: { label: "Pago", variant: "secondary" },
  PARTIALLY_PAID: { label: "Parcial", variant: "outline" },
  OVERDUE: { label: "Vencido", variant: "destructive" },
  IN_AGREEMENT: { label: "Em Acordo", variant: "outline" },
  CANCELLED: { label: "Cancelado", variant: "outline" },
  WRITTEN_OFF: { label: "Baixado", variant: "outline" },
};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [payment, setPayment] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    amount: "",
    paymentMethod: "PIX",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    fetchInvoice();
  }, []);

  async function fetchInvoice() {
    try {
      const res = await api.get(`/invoices/${params.id}`);
      setInvoice(res.data);
    } catch {
      toast.error("Fatura não encontrada");
      router.push("/dashboard/invoices");
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!payment.amount) {
      toast.error("Informe o valor");
      return;
    }
    try {
      setPaymentLoading(true);
      await api.post(`/invoices/${params.id}/payments`, {
        paymentDate: payment.paymentDate,
        amount: parseFloat(payment.amount),
        paymentMethod: payment.paymentMethod,
        reference: payment.reference || undefined,
        notes: payment.notes || undefined,
      });
      toast.success("Pagamento registrado!");
      setPaymentOpen(false);
      setPayment({ paymentDate: new Date().toISOString().split("T")[0], amount: "", paymentMethod: "PIX", reference: "", notes: "" });
      fetchInvoice();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao registrar pagamento");
    } finally {
      setPaymentLoading(false);
    }
  }

  function formatCurrency(v: number) {
    return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  if (!invoice) return null;

  const remaining = Number(invoice.amount) - Number(invoice.paidAmount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/invoices")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Fatura {invoice.invoiceNumber}</h1>
            <p className="text-muted-foreground">{invoice.customer.nomeFantasia || invoice.customer.razaoSocial}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
              <DialogTrigger asChild>
                <Button><DollarSign className="mr-2 h-4 w-4" /> Registrar Pagamento</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Pagamento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Restante: {formatCurrency(remaining)}</label>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Valor (R$) *</label>
                    <Input type="number" step="0.01" max={remaining} value={payment.amount} onChange={(e) => setPayment(p => ({ ...p, amount: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data do Pagamento</label>
                    <Input type="date" value={payment.paymentDate} onChange={(e) => setPayment(p => ({ ...p, paymentDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Método</label>
                    <Select value={payment.paymentMethod} onValueChange={(v) => setPayment(p => ({ ...p, paymentMethod: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="BOLETO">Boleto</SelectItem>
                        <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                        <SelectItem value="CARTAO">Cartão</SelectItem>
                        <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Referência</label>
                    <Input value={payment.reference} onChange={(e) => setPayment(p => ({ ...p, reference: e.target.value }))} placeholder="Nº do comprovante" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setPaymentOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={paymentLoading}>{paymentLoading ? "Salvando..." : "Confirmar"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline" onClick={() => router.push(`/dashboard/invoices/${invoice.id}/editar`)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Detalhes da Fatura</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={statusMap[invoice.status]?.variant || "outline"}>{statusMap[invoice.status]?.label || invoice.status}</Badge>
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Emissão</span><span>{new Date(invoice.issueDate).toLocaleDateString("pt-BR")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Vencimento</span><span>{new Date(invoice.dueDate).toLocaleDateString("pt-BR")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Valor Total</span><span className="font-bold">{formatCurrency(Number(invoice.amount))}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Valor Pago</span><span className="text-green-600 font-medium">{formatCurrency(Number(invoice.paidAmount))}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Restante</span><span className="text-red-600 font-medium">{formatCurrency(remaining)}</span></div>
            {invoice.contract && (
              <div className="flex justify-between"><span className="text-muted-foreground">Contrato</span><span className="cursor-pointer text-blue-600" onClick={() => router.push(`/dashboard/contracts/${invoice.contract!.id}`)}>{invoice.contract.contractNumber}</span></div>
            )}
            {invoice.billingPeriodStart && invoice.billingPeriodEnd && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Período de Faturamento</span>
                <span>{new Date(invoice.billingPeriodStart).toLocaleDateString("pt-BR")} — {new Date(invoice.billingPeriodEnd).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
            {invoice.notes && <div className="pt-2 border-t"><p className="text-sm text-muted-foreground">{invoice.notes}</p></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Razão Social</span><span>{invoice.customer.razaoSocial}</span></div>
            {invoice.customer.nomeFantasia && <div className="flex justify-between"><span className="text-muted-foreground">Nome Fantasia</span><span>{invoice.customer.nomeFantasia}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">CPF/CNPJ</span><span>{invoice.customer.cpfCnpj}</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Items faturados (containers) */}
      {invoice.items && invoice.items.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Containers Faturados ({invoice.items.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium">Container</th>
                    <th className="px-4 py-2 text-left font-medium">Período</th>
                    <th className="px-4 py-2 text-right font-medium">Dias</th>
                    <th className="px-4 py-2 text-right font-medium">Excluídos</th>
                    <th className="px-4 py-2 text-right font-medium">Cobrados</th>
                    <th className="px-4 py-2 text-right font-medium">Diária</th>
                    <th className="px-4 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item: any) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-2 font-mono font-medium">{item.assetCode}</td>
                      <td className="px-4 py-2 text-xs">
                        {new Date(item.periodStart).toLocaleDateString("pt-BR")} — {new Date(item.periodEnd).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-2 text-right">{item.totalDays}</td>
                      <td className="px-4 py-2 text-right">
                        {item.excludedDays > 0 ? (
                          <span className="text-red-600" title={item.excludedReason || ""}>
                            {item.excludedDays} {item.excludedReason ? `(${item.excludedReason})` : ""}
                          </span>
                        ) : "0"}
                      </td>
                      <td className="px-4 py-2 text-right font-medium">{item.billedDays}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(Number(item.dailyRate))}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(Number(item.totalValue))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Pagamentos ({invoice.payments.length})</CardTitle></CardHeader>
        <CardContent>
          {invoice.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pagamento registrado</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50"><th className="px-4 py-2 text-left font-medium">Data</th><th className="px-4 py-2 text-right font-medium">Valor</th><th className="px-4 py-2 text-left font-medium">Método</th><th className="px-4 py-2 text-left font-medium">Referência</th></tr></thead>
                <tbody>{invoice.payments.map((p: any) => (
                  <tr key={p.id} className="border-b"><td className="px-4 py-2">{new Date(p.paymentDate).toLocaleDateString("pt-BR")}</td><td className="px-4 py-2 text-right font-medium text-green-600">{formatCurrency(Number(p.amount))}</td><td className="px-4 py-2">{p.paymentMethod || "-"}</td><td className="px-4 py-2">{p.reference || "-"}</td></tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collection Actions */}
      <CollectionActionsSection invoiceId={invoice.id} actions={invoice.collectionActions || []} onRefresh={fetchInvoice} status={invoice.status} remaining={remaining} />
    </div>
  );
}

function CollectionActionsSection({ invoiceId, actions, onRefresh, status, remaining }: { invoiceId: string; actions: any[]; onRefresh: () => void; status: string; remaining: number }) {
  const [actionOpen, setActionOpen] = useState(false);
  const [savingAction, setSavingAction] = useState(false);
  const [actionForm, setActionForm] = useState({ type: "PHONE_CALL", description: "", contactedPerson: "", result: "" });

  const [agreementOpen, setAgreementOpen] = useState(false);
  const [savingAgreement, setSavingAgreement] = useState(false);
  const [agreementForm, setAgreementForm] = useState({ totalAmount: "", installments: "1", firstDueDate: "", notes: "" });

  const [defaulterOpen, setDefaulterOpen] = useState(false);
  const [savingDefaulter, setSavingDefaulter] = useState(false);
  const [defaulterForm, setDefaulterForm] = useState({ reason: "", notes: "" });

  function formatDate(d: string) { try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return "—"; } }

  const actionTypeLabels: Record<string, string> = { PHONE_CALL: "Ligação", EMAIL: "E-mail", LETTER: "Carta", VISIT: "Visita", PROTEST: "Protesto", LEGAL_ACTION: "Ação Judicial", OTHER: "Outro" };

  async function handleAddAction(e: React.FormEvent) {
    e.preventDefault();
    if (!actionForm.description) { toast.error("Descrição obrigatória"); return; }
    setSavingAction(true);
    try {
      await api.post(`/invoices/${invoiceId}/collection-actions`, { type: actionForm.type, description: actionForm.description, contactedPerson: actionForm.contactedPerson || undefined, result: actionForm.result || undefined });
      toast.success("Ação registrada!"); setActionOpen(false); setActionForm({ type: "PHONE_CALL", description: "", contactedPerson: "", result: "" }); onRefresh();
    } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); } finally { setSavingAction(false); }
  }

  async function handleAddAgreement(e: React.FormEvent) {
    e.preventDefault();
    if (!agreementForm.totalAmount || !agreementForm.firstDueDate) { toast.error("Preencha valor e data"); return; }
    setSavingAgreement(true);
    try {
      await api.post(`/invoices/${invoiceId}/agreements`, { totalAmount: parseFloat(agreementForm.totalAmount), installments: parseInt(agreementForm.installments), firstDueDate: new Date(agreementForm.firstDueDate).toISOString(), notes: agreementForm.notes || undefined });
      toast.success("Acordo criado!"); setAgreementOpen(false); setAgreementForm({ totalAmount: "", installments: "1", firstDueDate: "", notes: "" }); onRefresh();
    } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); } finally { setSavingAgreement(false); }
  }

  async function handleAddDefaulter(e: React.FormEvent) {
    e.preventDefault();
    if (!defaulterForm.reason) { toast.error("Motivo obrigatório"); return; }
    setSavingDefaulter(true);
    try {
      await api.post(`/invoices/defaulters`, { invoiceId, reason: defaulterForm.reason, notes: defaulterForm.notes || undefined });
      toast.success("Inadimplente registrado!"); setDefaulterOpen(false); setDefaulterForm({ reason: "", notes: "" }); onRefresh();
    } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); } finally { setSavingDefaulter(false); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="flex items-center gap-2"><Phone className="w-5 h-5 text-orange-600" /> Ações de Cobrança ({actions.length})</CardTitle></div>
        <div className="flex gap-2">
          {status !== "PAID" && status !== "CANCELLED" && (
            <>
              <Dialog open={actionOpen} onOpenChange={setActionOpen}><DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" /> Ação</Button></DialogTrigger>
                <DialogContent><DialogHeader><DialogTitle>Nova Ação de Cobrança</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddAction} className="space-y-4">
                    <div><Label>Tipo</Label><Select value={actionForm.type} onValueChange={v => setActionForm(p => ({ ...p, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PHONE_CALL">Ligação</SelectItem><SelectItem value="EMAIL">E-mail</SelectItem><SelectItem value="LETTER">Carta</SelectItem><SelectItem value="VISIT">Visita</SelectItem><SelectItem value="PROTEST">Protesto</SelectItem><SelectItem value="LEGAL_ACTION">Ação Judicial</SelectItem><SelectItem value="OTHER">Outro</SelectItem></SelectContent></Select></div>
                    <div><Label>Descrição *</Label><Textarea value={actionForm.description} onChange={e => setActionForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
                    <div><Label>Pessoa Contatada</Label><Input value={actionForm.contactedPerson} onChange={e => setActionForm(p => ({ ...p, contactedPerson: e.target.value }))} /></div>
                    <div><Label>Resultado</Label><Textarea value={actionForm.result} onChange={e => setActionForm(p => ({ ...p, result: e.target.value }))} rows={2} /></div>
                    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setActionOpen(false)}>Cancelar</Button><Button type="submit" disabled={savingAction}>{savingAction ? "Salvando..." : "Registrar"}</Button></div>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={agreementOpen} onOpenChange={setAgreementOpen}><DialogTrigger asChild><Button size="sm" variant="outline"><Handshake className="w-4 h-4 mr-1" /> Acordo</Button></DialogTrigger>
                <DialogContent><DialogHeader><DialogTitle>Novo Acordo de Pagamento</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddAgreement} className="space-y-4">
                    <div><Label>Valor Total do Acordo *</Label><Input type="number" step="0.01" value={agreementForm.totalAmount} onChange={e => setAgreementForm(p => ({ ...p, totalAmount: e.target.value }))} placeholder={String(remaining)} /></div>
                    <div><Label>Parcelas</Label><Input type="number" min="1" value={agreementForm.installments} onChange={e => setAgreementForm(p => ({ ...p, installments: e.target.value }))} /></div>
                    <div><Label>Primeiro Vencimento *</Label><Input type="date" value={agreementForm.firstDueDate} onChange={e => setAgreementForm(p => ({ ...p, firstDueDate: e.target.value }))} /></div>
                    <div><Label>Observações</Label><Textarea value={agreementForm.notes} onChange={e => setAgreementForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
                    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setAgreementOpen(false)}>Cancelar</Button><Button type="submit" disabled={savingAgreement}>{savingAgreement ? "Salvando..." : "Criar Acordo"}</Button></div>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={defaulterOpen} onOpenChange={setDefaulterOpen}><DialogTrigger asChild><Button size="sm" variant="destructive"><AlertTriangle className="w-4 h-4 mr-1" /> Inadimplente</Button></DialogTrigger>
                <DialogContent><DialogHeader><DialogTitle>Registrar como Inadimplente</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddDefaulter} className="space-y-4">
                    <div><Label>Motivo *</Label><Textarea value={defaulterForm.reason} onChange={e => setDefaulterForm(p => ({ ...p, reason: e.target.value }))} rows={2} /></div>
                    <div><Label>Observações</Label><Textarea value={defaulterForm.notes} onChange={e => setDefaulterForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
                    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDefaulterOpen(false)}>Cancelar</Button><Button type="submit" variant="destructive" disabled={savingDefaulter}>{savingDefaulter ? "Salvando..." : "Registrar"}</Button></div>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma ação de cobrança registrada</p>
        ) : (
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50"><th className="px-4 py-2 text-left font-medium">Data</th><th className="px-4 py-2 text-left font-medium">Tipo</th><th className="px-4 py-2 text-left font-medium">Descrição</th><th className="px-4 py-2 text-left font-medium">Contato</th><th className="px-4 py-2 text-left font-medium">Resultado</th></tr></thead>
              <tbody>{actions.map((a: any) => (
                <tr key={a.id} className="border-b"><td className="px-4 py-2 text-sm">{formatDate(a.createdAt || a.actionDate)}</td><td className="px-4 py-2"><Badge variant="outline">{actionTypeLabels[a.type] || a.type}</Badge></td><td className="px-4 py-2 max-w-[200px] truncate">{a.description}</td><td className="px-4 py-2">{a.contactedPerson || "—"}</td><td className="px-4 py-2 max-w-[150px] truncate">{a.result || "—"}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
