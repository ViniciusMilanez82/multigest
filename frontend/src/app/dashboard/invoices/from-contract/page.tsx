"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Package } from "lucide-react";
import { toast } from "sonner";

interface ContractItem {
  id: string;
  assetId: string;
  dailyRate: number;
  departureDate: string | null;
  startDate: string;
  endDate: string | null;
  returnDate: string | null;
  isActive: boolean;
  asset: { code: string; assetType?: { name: string } };
}

interface Contract {
  id: string;
  contractNumber: string;
  type: string;
  customerId: string;
  customer: { razaoSocial: string; nomeFantasia: string | null; cpfCnpj: string };
  items: ContractItem[];
}

interface ItemBilling {
  contractItemId: string;
  assetCode: string;
  selected: boolean;
  dailyRate: number;
  excludedDays: number;
  excludedReason: string;
}

export default function InvoiceFromContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedContractId = searchParams.get("contractId");
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState(preselectedContractId || "");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    invoiceNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    billingPeriodStart: "",
    billingPeriodEnd: "",
    notes: "",
  });

  const [itemsBilling, setItemsBilling] = useState<ItemBilling[]>([]);

  useEffect(() => {
    api.get("/contracts", { params: { limit: 500, status: "ACTIVE" } })
      .then(r => setContracts(r.data.data))
      .catch(() => toast.error("Erro ao carregar contratos"));
    api.get("/invoices/next-number")
      .then(r => setForm(f => ({ ...f, invoiceNumber: r.data })))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedContractId) {
      fetchContract(selectedContractId);
      fetchLastBillingPeriod(selectedContractId);
    }
  }, [selectedContractId]);

  async function fetchLastBillingPeriod(contractId: string) {
    try {
      const r = await api.get("/invoices", { params: { contractId, limit: 1 } });
      const last = r.data?.data?.[0];
      if (last?.billingPeriodEnd) {
        const end = new Date(last.billingPeriodEnd);
        const nextStart = new Date(end);
        nextStart.setDate(nextStart.getDate() + 1);
        const nextEnd = new Date(nextStart.getFullYear(), nextStart.getMonth() + 1, 0);
        const due = new Date(nextEnd);
        due.setDate(due.getDate() + 10);
        setForm(f => ({
          ...f,
          billingPeriodStart: nextStart.toISOString().split("T")[0],
          billingPeriodEnd: nextEnd.toISOString().split("T")[0],
          dueDate: due.toISOString().split("T")[0],
        }));
      } else {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const due = new Date(end);
        due.setDate(due.getDate() + 10);
        setForm(f => ({
          ...f,
          billingPeriodStart: start.toISOString().split("T")[0],
          billingPeriodEnd: end.toISOString().split("T")[0],
          dueDate: due.toISOString().split("T")[0],
        }));
      }
    } catch { toast.error("Erro ao buscar período anterior"); }
  }

  async function fetchContract(id: string) {
    try {
      setLoading(true);
      const res = await api.get(`/contracts/${id}`);
      const contract = res.data;
      setSelectedContract(contract);
      setItemsBilling(
        contract.items
          .filter((i: ContractItem) => i.isActive)
          .map((i: ContractItem) => ({
            contractItemId: i.id,
            assetCode: i.asset.code,
            selected: true,
            dailyRate: Number(i.dailyRate),
            excludedDays: 0,
            excludedReason: "",
          }))
      );
    } catch {
      toast.error("Erro ao carregar contrato");
    } finally {
      setLoading(false);
    }
  }

  function calculateDays(start: string, end: string) {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  function getTotalValue() {
    const totalDays = calculateDays(form.billingPeriodStart, form.billingPeriodEnd);
    return itemsBilling
      .filter(i => i.selected)
      .reduce((sum, item) => {
        const billedDays = Math.max(0, totalDays - item.excludedDays);
        return sum + billedDays * item.dailyRate;
      }, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedContractId || !form.dueDate || !form.billingPeriodStart || !form.billingPeriodEnd) {
      toast.error("Preencha contrato, período e vencimento");
      return;
    }

    const selectedItems = itemsBilling.filter(i => i.selected);
    if (selectedItems.length === 0) {
      toast.error("Selecione pelo menos um container");
      return;
    }

    // Validar motivo de exclusão de dias
    for (const item of selectedItems) {
      if (item.excludedDays > 0 && !item.excludedReason.trim()) {
        toast.error(`Informe o motivo da exclusão de dias para o container ${item.assetCode}`);
        return;
      }
    }

    try {
      setSaving(true);
      const payload = {
        contractId: selectedContractId,
        invoiceNumber: form.invoiceNumber?.trim() || undefined,
        issueDate: form.issueDate || undefined,
        dueDate: form.dueDate,
        billingPeriodStart: form.billingPeriodStart,
        billingPeriodEnd: form.billingPeriodEnd,
        notes: form.notes || undefined,
        items: selectedItems.map(i => ({
          contractItemId: i.contractItemId,
          excludedDays: i.excludedDays,
          excludedReason: i.excludedReason || undefined,
        })),
      };

      const res = await api.post("/invoices/from-contract", payload);
      toast.success("Fatura gerada com sucesso!");
      router.push(`/dashboard/invoices/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao gerar fatura");
    } finally {
      setSaving(false);
    }
  }

  const totalDays = calculateDays(form.billingPeriodStart, form.billingPeriodEnd);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Faturar Contrato</h1>
          <p className="text-muted-foreground">Selecione o contrato, período e containers para faturar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de contrato */}
        <Card>
          <CardHeader><CardTitle>1. Selecione o Contrato</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Contrato *</label>
              <Select value={selectedContractId} onValueChange={setSelectedContractId}>
                <SelectTrigger><SelectValue placeholder="Selecione o contrato" /></SelectTrigger>
                <SelectContent>
                  {contracts.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.contractNumber} — {c.customer?.nomeFantasia || c.customer?.razaoSocial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedContract && (
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Cliente:</span> {selectedContract.customer.nomeFantasia || selectedContract.customer.razaoSocial}</p>
                <p><span className="text-muted-foreground">CNPJ:</span> {selectedContract.customer.cpfCnpj}</p>
                <p><span className="text-muted-foreground">Tipo:</span>{" "}
                  <Badge variant="outline">
                    {selectedContract.type === "MEDICAO" ? "Medição" : selectedContract.type === "ANTECIPADO" ? "Antecipado" : "Automático"}
                  </Badge>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Período e dados da fatura */}
        <Card>
          <CardHeader><CardTitle>2. Período de Faturamento</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Início do Período *</label>
              <Input type="date" value={form.billingPeriodStart} onChange={e => setForm(f => ({ ...f, billingPeriodStart: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Fim do Período *</label>
              <Input type="date" value={form.billingPeriodEnd} onChange={e => {
                const end = e.target.value;
                const due = new Date(end);
                due.setDate(due.getDate() + 10);
                const dueStr = due.toISOString().split("T")[0];
                setForm(f => ({
                  ...f,
                  billingPeriodEnd: end,
                  dueDate: (!f.dueDate || f.dueDate <= end) ? dueStr : f.dueDate
                }));
              }} />
            </div>
            <div>
              <label className="text-sm font-medium">Nº da Fatura</label>
              <Input value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} placeholder="Automático (ex: 2026-0001)" />
            </div>
            <div>
              <label className="text-sm font-medium">Data de Vencimento *</label>
              <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Data de Emissão</label>
              <Input type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} />
            </div>
            {totalDays > 0 && (
              <div className="flex items-center">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  {totalDays} dias no período
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Containers do contrato */}
        {selectedContract && itemsBilling.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>3. Containers a Faturar</CardTitle>
              <p className="text-sm text-muted-foreground">Marque os containers e informe dias excluídos (com motivo obrigatório)</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {itemsBilling.map((item, idx) => (
                  <div key={item.contractItemId} className={`p-4 rounded-lg border ${item.selected ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-gray-50"}`}>
                    <div className="flex items-center gap-4 mb-3">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={e => {
                          const updated = [...itemsBilling];
                          updated[idx].selected = e.target.checked;
                          setItemsBilling(updated);
                        }}
                        className="h-5 w-5 rounded"
                      />
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono font-bold">{item.assetCode}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">R$ {item.dailyRate.toFixed(2)}/dia</span>
                      {item.selected && totalDays > 0 && (
                        <Badge variant="default" className="ml-auto">
                          {Math.max(0, totalDays - item.excludedDays)} dias = R$ {(Math.max(0, totalDays - item.excludedDays) * item.dailyRate).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    {item.selected && (
                      <div className="grid gap-3 md:grid-cols-2 ml-9">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Dias a NÃO faturar</label>
                          <Input
                            type="number"
                            min={0}
                            max={totalDays}
                            value={item.excludedDays || ""}
                            onChange={e => {
                              const updated = [...itemsBilling];
                              updated[idx].excludedDays = parseInt(e.target.value) || 0;
                              setItemsBilling(updated);
                            }}
                            placeholder="0"
                          />
                        </div>
                        {item.excludedDays > 0 && (
                          <div>
                            <label className="text-xs font-medium text-red-600">Motivo da exclusão *</label>
                            <Input
                              value={item.excludedReason}
                              onChange={e => {
                                const updated = [...itemsBilling];
                                updated[idx].excludedReason = e.target.value;
                                setItemsBilling(updated);
                              }}
                              placeholder="Ex: Container estava em manutenção"
                              className="border-red-200"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalDays > 0 && (
                <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total da Fatura</span>
                    <span className="text-2xl font-bold text-emerald-700">
                      R$ {getTotalValue().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Observações</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Observações da fatura (opcional)" />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? "Gerando..." : "Gerar Fatura"}</Button>
        </div>
      </form>
    </div>
  );
}
