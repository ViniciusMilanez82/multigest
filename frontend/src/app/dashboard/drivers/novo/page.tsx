"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function NewDriverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", cpf: "", cnh: "", cnhCategory: "B", cnhExpiry: "", phone: "" });
  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.cpf || !form.cnh || !form.cnhExpiry) { toast.error("Preencha os campos obrigatórios"); return; }
    try {
      setLoading(true);
      const payload: any = { name: form.name, cpf: form.cpf, cnh: form.cnh, cnhCategory: form.cnhCategory, cnhExpiry: new Date(form.cnhExpiry).toISOString() };
      if (form.phone) payload.phone = form.phone;
      await api.post("/fleet/drivers", payload);
      toast.success("Motorista cadastrado!"); router.push("/dashboard/drivers");
    } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button><h1 className="text-2xl font-bold">Novo Motorista</h1></div>
      <form onSubmit={handleSubmit}>
        <Card><CardHeader><CardTitle>Dados do Motorista</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2"><label className="text-sm font-medium">Nome Completo *</label><Input value={form.name} onChange={e => set("name", e.target.value)} /></div>
          <div><label className="text-sm font-medium">CPF *</label><Input value={form.cpf} onChange={e => set("cpf", e.target.value)} /></div>
          <div><label className="text-sm font-medium">CNH *</label><Input value={form.cnh} onChange={e => set("cnh", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Categoria CNH</label><Input value={form.cnhCategory} onChange={e => set("cnhCategory", e.target.value)} placeholder="B, C, D, E" /></div>
          <div><label className="text-sm font-medium">Validade CNH *</label><Input type="date" value={form.cnhExpiry} onChange={e => set("cnhExpiry", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Telefone</label><Input value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
        </CardContent></Card>
        <div className="flex justify-end gap-3 mt-6"><Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button><Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Cadastrar"}</Button></div>
      </form>
    </div>
  );
}
