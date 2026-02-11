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

export default function NewBiddingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ number: "", modality: "", agency: "", object: "", openingDate: "", estimatedValue: "", notes: "" });
  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.number) { toast.error("Número é obrigatório"); return; }
    try {
      setLoading(true);
      const payload: any = { number: form.number, status: "ABERTA" };
      if (form.modality) payload.modality = form.modality;
      if (form.agency) payload.agency = form.agency;
      if (form.object) payload.object = form.object;
      if (form.openingDate) payload.openingDate = new Date(form.openingDate).toISOString();
      if (form.estimatedValue) payload.estimatedValue = parseFloat(form.estimatedValue);
      if (form.notes) payload.notes = form.notes;
      const res = await api.post("/api/biddings", payload);
      toast.success("Licitação cadastrada!"); router.push(`/dashboard/biddings/${res.data.id}`);
    } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button><h1 className="text-2xl font-bold">Nova Licitação</h1></div>
      <form onSubmit={handleSubmit}>
        <Card><CardHeader><CardTitle>Dados da Licitação</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><label className="text-sm font-medium">Número *</label><Input value={form.number} onChange={e => set("number", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Modalidade</label><Select value={form.modality} onValueChange={v => set("modality", v)}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="PREGAO_ELETRONICO">Pregão Eletrônico</SelectItem><SelectItem value="PREGAO_PRESENCIAL">Pregão Presencial</SelectItem><SelectItem value="TOMADA_PRECOS">Tomada de Preços</SelectItem><SelectItem value="CONCORRENCIA">Concorrência</SelectItem><SelectItem value="CONVITE">Convite</SelectItem><SelectItem value="DISPENSA">Dispensa</SelectItem></SelectContent></Select></div>
          <div><label className="text-sm font-medium">Órgão</label><Input value={form.agency} onChange={e => set("agency", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Data de Abertura</label><Input type="date" value={form.openingDate} onChange={e => set("openingDate", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Valor Estimado (R$)</label><Input type="number" step="0.01" value={form.estimatedValue} onChange={e => set("estimatedValue", e.target.value)} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Objeto</label><Textarea value={form.object} onChange={e => set("object", e.target.value)} rows={3} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Observações</label><Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} /></div>
        </CardContent></Card>
        <div className="flex justify-end gap-3 mt-6"><Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button><Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Cadastrar"}</Button></div>
      </form>
    </div>
  );
}
