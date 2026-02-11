"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cpfCnpj: string;
}

interface Contract {
  id: string;
  contractNumber: string;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [form, setForm] = useState({
    customerId: "",
    contractId: "",
    invoiceNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    amount: "",
    notes: "",
  });

  useEffect(() => {
    api.get("/customers", { params: { limit: 500 } }).then((r) => setCustomers(r.data.data)).catch(() => {});
    api.get("/contracts", { params: { limit: 500, status: "ACTIVE" } }).then((r) => setContracts(r.data.data)).catch(() => {});
  }, []);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerId || !form.invoiceNumber || !form.dueDate || !form.amount) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    try {
      setLoading(true);
      const payload: any = {
        customerId: form.customerId,
        invoiceNumber: form.invoiceNumber,
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        amount: parseFloat(form.amount),
      };
      if (form.contractId) payload.contractId = form.contractId;
      if (form.notes) payload.notes = form.notes;

      const res = await api.post("/invoices", payload);
      toast.success("Fatura criada com sucesso!");
      router.push(`/dashboard/invoices/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar fatura");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Nova Fatura</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Dados da Fatura</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Cliente *</label>
              <Select value={form.customerId} onValueChange={(v) => set("customerId", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nomeFantasia || c.razaoSocial} - {c.cpfCnpj}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Contrato (opcional)</label>
              <Select value={form.contractId} onValueChange={(v) => set("contractId", v)}>
                <SelectTrigger><SelectValue placeholder="Vincular a contrato" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {contracts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.contractNumber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Nº da Fatura *</label>
              <Input value={form.invoiceNumber} onChange={(e) => set("invoiceNumber", e.target.value)} placeholder="NF-2026-001" />
            </div>
            <div>
              <label className="text-sm font-medium">Valor (R$) *</label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="5000.00" />
            </div>
            <div>
              <label className="text-sm font-medium">Data de Emissão</label>
              <Input type="date" value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Data de Vencimento *</label>
              <Input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Observações</label>
              <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Criar Fatura"}</Button>
        </div>
      </form>
    </div>
  );
}
