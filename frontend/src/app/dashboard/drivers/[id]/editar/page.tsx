"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EditDriverPage() {
  const router = useRouter(); const params = useParams();
  const [loading, setLoading] = useState(false); const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ name: "", cpf: "", cnh: "", cnhCategory: "", cnhExpiry: "", phone: "", isActive: true });
  function set(f: string, v: any) { setForm(p => ({ ...p, [f]: v })); }

  useEffect(() => { api.get(`/api/fleet/drivers/${params.id}`).then(r => { const d = r.data; setForm({ name: d.name || "", cpf: d.cpf || "", cnh: d.cnh || "", cnhCategory: d.cnhCategory || "", cnhExpiry: d.cnhExpiry ? d.cnhExpiry.split("T")[0] : "", phone: d.phone || "", isActive: d.isActive ?? true }); }).catch(() => { toast.error("Não encontrado"); router.push("/dashboard/drivers"); }).finally(() => setFetching(false)); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try { setLoading(true); await api.put(`/api/fleet/drivers/${params.id}`, { ...form, cnhExpiry: new Date(form.cnhExpiry).toISOString() }); toast.success("Atualizado!"); router.push(`/dashboard/drivers/${params.id}`); } catch (e: any) { toast.error(e.response?.data?.message || "Erro"); } finally { setLoading(false); }
  }

  if (fetching) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button><h1 className="text-2xl font-bold">Editar Motorista</h1></div>
      <form onSubmit={handleSubmit}>
        <Card><CardHeader><CardTitle>Dados</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2"><label className="text-sm font-medium">Nome</label><Input value={form.name} onChange={e => set("name", e.target.value)} /></div>
          <div><label className="text-sm font-medium">CPF</label><Input value={form.cpf} onChange={e => set("cpf", e.target.value)} /></div>
          <div><label className="text-sm font-medium">CNH</label><Input value={form.cnh} onChange={e => set("cnh", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Categoria</label><Input value={form.cnhCategory} onChange={e => set("cnhCategory", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Validade CNH</label><Input type="date" value={form.cnhExpiry} onChange={e => set("cnhExpiry", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Telefone</label><Input value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
        </CardContent></Card>
        <div className="flex justify-end gap-3 mt-6"><Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button><Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button></div>
      </form>
    </div>
  );
}
