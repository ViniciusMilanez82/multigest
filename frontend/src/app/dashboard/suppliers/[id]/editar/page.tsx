"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EditSupplierPage() {
  const router = useRouter(); const params = useParams();
  const [loading, setLoading] = useState(false); const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ type: "JURIDICA", cpfCnpj: "", razaoSocial: "", nomeFantasia: "", category: "", notes: "" });
  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })); }

  useEffect(() => { api.get(`/suppliers/${params.id}`).then(r => { const s = r.data; setForm({ type: s.type || "JURIDICA", cpfCnpj: s.cpfCnpj || "", razaoSocial: s.razaoSocial || "", nomeFantasia: s.nomeFantasia || "", category: s.category || "", notes: s.notes || "" }); }).catch(() => { toast.error("Não encontrado"); router.push("/dashboard/suppliers"); }).finally(() => setFetching(false)); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try { setLoading(true); await api.put(`/suppliers/${params.id}`, { type: form.type, cpfCnpj: form.cpfCnpj, razaoSocial: form.razaoSocial, nomeFantasia: form.nomeFantasia || undefined, category: form.category || undefined, notes: form.notes || undefined }); toast.success("Atualizado!"); router.push(`/dashboard/suppliers/${params.id}`); } catch (e: any) { toast.error(e.response?.data?.message || "Erro"); } finally { setLoading(false); }
  }

  if (fetching) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button><h1 className="text-2xl font-bold">Editar Fornecedor</h1></div>
      <form onSubmit={handleSubmit}>
        <Card><CardHeader><CardTitle>Dados</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
          <div><label className="text-sm font-medium">Tipo</label><Select value={form.type} onValueChange={v => set("type", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="JURIDICA">PJ</SelectItem><SelectItem value="FISICA">PF</SelectItem></SelectContent></Select></div>
          <div><label className="text-sm font-medium">CPF/CNPJ</label><Input value={form.cpfCnpj} onChange={e => set("cpfCnpj", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Razão Social</label><Input value={form.razaoSocial} onChange={e => set("razaoSocial", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Nome Fantasia</label><Input value={form.nomeFantasia} onChange={e => set("nomeFantasia", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Categoria</label><Input value={form.category} onChange={e => set("category", e.target.value)} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Observações</label><Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} /></div>
        </CardContent></Card>
        <div className="flex justify-end gap-3 mt-6"><Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button><Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button></div>
      </form>
    </div>
  );
}
