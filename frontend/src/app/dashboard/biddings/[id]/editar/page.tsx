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

export default function EditBiddingPage() {
  const router = useRouter(); const params = useParams();
  const [loading, setLoading] = useState(false); const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ number: "", modality: "", agency: "", object: "", openingDate: "", estimatedValue: "", notes: "", status: "ABERTA" });
  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })); }

  useEffect(() => { api.get(`/api/biddings/${params.id}`).then(r => { const b = r.data; setForm({ number: b.number || "", modality: b.modality || "", agency: b.agency || "", object: b.object || "", openingDate: b.openingDate ? b.openingDate.split("T")[0] : "", estimatedValue: b.estimatedValue ? String(b.estimatedValue) : "", notes: b.notes || "", status: b.status || "ABERTA" }); }).catch(() => { toast.error("Não encontrado"); router.push("/dashboard/biddings"); }).finally(() => setFetching(false)); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      const payload: any = { number: form.number, status: form.status };
      if (form.modality) payload.modality = form.modality;
      if (form.agency) payload.agency = form.agency;
      if (form.object) payload.object = form.object;
      if (form.openingDate) payload.openingDate = new Date(form.openingDate).toISOString();
      if (form.estimatedValue) payload.estimatedValue = parseFloat(form.estimatedValue);
      if (form.notes) payload.notes = form.notes;
      await api.put(`/api/biddings/${params.id}`, payload);
      toast.success("Atualizado!"); router.push(`/dashboard/biddings/${params.id}`);
    } catch (e: any) { toast.error(e.response?.data?.message || "Erro"); } finally { setLoading(false); }
  }

  if (fetching) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button><h1 className="text-2xl font-bold">Editar Licitação</h1></div>
      <form onSubmit={handleSubmit}>
        <Card><CardHeader><CardTitle>Dados</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
          <div><label className="text-sm font-medium">Número</label><Input value={form.number} onChange={e => set("number", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Modalidade</label><Select value={form.modality} onValueChange={v => set("modality", v)}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="PREGAO_ELETRONICO">Pregão Eletrônico</SelectItem><SelectItem value="PREGAO_PRESENCIAL">Pregão Presencial</SelectItem><SelectItem value="TOMADA_PRECOS">Tomada de Preços</SelectItem><SelectItem value="CONCORRENCIA">Concorrência</SelectItem><SelectItem value="CONVITE">Convite</SelectItem><SelectItem value="DISPENSA">Dispensa</SelectItem></SelectContent></Select></div>
          <div><label className="text-sm font-medium">Órgão</label><Input value={form.agency} onChange={e => set("agency", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Abertura</label><Input type="date" value={form.openingDate} onChange={e => set("openingDate", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Valor Estimado</label><Input type="number" step="0.01" value={form.estimatedValue} onChange={e => set("estimatedValue", e.target.value)} /></div>
          <div><label className="text-sm font-medium">Status</label><Select value={form.status} onValueChange={v => set("status", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ABERTA">Aberta</SelectItem><SelectItem value="EM_ANALISE">Em Análise</SelectItem><SelectItem value="ADJUDICADA">Adjudicada</SelectItem><SelectItem value="CANCELADA">Cancelada</SelectItem><SelectItem value="ENCERRADA">Encerrada</SelectItem></SelectContent></Select></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Objeto</label><Textarea value={form.object} onChange={e => set("object", e.target.value)} rows={3} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Observações</label><Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} /></div>
        </CardContent></Card>
        <div className="flex justify-end gap-3 mt-6"><Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button><Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button></div>
      </form>
    </div>
  );
}
