"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function NewSupplierPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: "JURIDICA", cpfCnpj: "", razaoSocial: "", nomeFantasia: "", category: "", notes: "" });
  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cpfCnpj || !form.razaoSocial) { toast.error("CPF/CNPJ e Razão Social são obrigatórios"); return; }
    try {
      setLoading(true);
      const payload: any = { type: form.type, cpfCnpj: form.cpfCnpj, razaoSocial: form.razaoSocial };
      if (form.nomeFantasia) payload.nomeFantasia = form.nomeFantasia;
      if (form.category) payload.category = form.category;
      if (form.notes) payload.notes = form.notes;
      const res = await api.post("/api/suppliers", payload);
      toast.success("Fornecedor cadastrado!"); router.push(`/dashboard/suppliers/${res.data.id}`);
    } catch (err: any) { toast.error(err.response?.data?.message || "Erro ao cadastrar"); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button><h1 className="text-2xl font-bold">Novo Fornecedor</h1></div>
      <form onSubmit={handleSubmit}>
        <Card><CardHeader><CardTitle>Dados do Fornecedor</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><label className="text-sm font-medium">Tipo</label><Select value={form.type} onValueChange={v => set("type", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="JURIDICA">Pessoa Jurídica</SelectItem><SelectItem value="FISICA">Pessoa Física</SelectItem></SelectContent></Select></div>
          <div><label className="text-sm font-medium">CPF/CNPJ *</label><Input value={form.cpfCnpj} onChange={e => set("cpfCnpj", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Razão Social *</label><Input value={form.razaoSocial} onChange={e => set("razaoSocial", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Nome Fantasia</label><Input value={form.nomeFantasia} onChange={e => set("nomeFantasia", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Categoria</label><Input value={form.category} onChange={e => set("category", e.target.value)} placeholder="Mecânica, Peças, etc." /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Observações</label><Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} /></div>
        </CardContent></Card>
        <div className="flex justify-end gap-3 mt-6"><Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button><Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Cadastrar"}</Button></div>
      </form>
    </div>
  );
}
