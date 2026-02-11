"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    invoiceNumber: "",
    issueDate: "",
    dueDate: "",
    amount: "",
    notes: "",
  });

  useEffect(() => {
    fetchInvoice();
  }, []);

  async function fetchInvoice() {
    try {
      const res = await api.get(`/api/invoices/${params.id}`);
      const inv = res.data;
      setForm({
        invoiceNumber: inv.invoiceNumber || "",
        issueDate: inv.issueDate?.split("T")[0] || "",
        dueDate: inv.dueDate?.split("T")[0] || "",
        amount: inv.amount?.toString() || "",
        notes: inv.notes || "",
      });
    } catch {
      toast.error("Fatura não encontrada");
      router.push("/dashboard/invoices");
    } finally {
      setFetching(false);
    }
  }

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put(`/api/invoices/${params.id}`, {
        invoiceNumber: form.invoiceNumber,
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        amount: parseFloat(form.amount),
        notes: form.notes || undefined,
      });
      toast.success("Fatura atualizada!");
      router.push(`/dashboard/invoices/${params.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Editar Fatura</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Dados da Fatura</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Nº da Fatura</label>
              <Input value={form.invoiceNumber} onChange={(e) => set("invoiceNumber", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Data de Emissão</label>
              <Input type="date" value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Data de Vencimento</label>
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
          <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar Alterações"}</Button>
        </div>
      </form>
    </div>
  );
}
