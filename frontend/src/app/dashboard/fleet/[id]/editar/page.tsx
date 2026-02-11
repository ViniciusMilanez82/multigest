"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    plate: "",
    type: "",
    brand: "",
    model: "",
    year: "",
    renavam: "",
    loadCapacityKg: "",
    currentKm: "",
    status: "AVAILABLE",
  });

  useEffect(() => {
    fetchVehicle();
  }, []);

  async function fetchVehicle() {
    try {
      const res = await api.get(`/api/vehicles/${params.id}`);
      const v = res.data;
      setForm({
        plate: v.plate || "",
        type: v.type || "",
        brand: v.brand || "",
        model: v.model || "",
        year: v.year?.toString() || "",
        renavam: v.renavam || "",
        loadCapacityKg: v.loadCapacityKg?.toString() || "",
        currentKm: v.currentKm?.toString() || "",
        status: v.status || "AVAILABLE",
      });
    } catch {
      toast.error("Veículo não encontrado");
      router.push("/dashboard/fleet");
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
      const payload: any = {
        plate: form.plate.toUpperCase(),
        type: form.type,
        status: form.status,
      };
      if (form.brand) payload.brand = form.brand;
      if (form.model) payload.model = form.model;
      if (form.year) payload.year = parseInt(form.year);
      if (form.renavam) payload.renavam = form.renavam;
      if (form.loadCapacityKg) payload.loadCapacityKg = parseFloat(form.loadCapacityKg);
      if (form.currentKm) payload.currentKm = parseInt(form.currentKm);

      await api.put(`/api/vehicles/${params.id}`, payload);
      toast.success("Veículo atualizado!");
      router.push(`/dashboard/fleet/${params.id}`);
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
        <h1 className="text-2xl font-bold">Editar Veículo</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Dados do Veículo</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Placa *</label>
              <Input value={form.plate} onChange={(e) => set("plate", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo *</label>
              <Input value={form.type} onChange={(e) => set("type", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Marca</label>
              <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Modelo</label>
              <Input value={form.model} onChange={(e) => set("model", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Ano</label>
              <Input type="number" value={form.year} onChange={(e) => set("year", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">RENAVAM</label>
              <Input value={form.renavam} onChange={(e) => set("renavam", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Capacidade de Carga (kg)</label>
              <Input type="number" step="0.01" value={form.loadCapacityKg} onChange={(e) => set("loadCapacityKg", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">KM Atual</label>
              <Input type="number" value={form.currentKm} onChange={(e) => set("currentKm", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Disponível</SelectItem>
                  <SelectItem value="IN_OPERATION">Em Operação</SelectItem>
                  <SelectItem value="IN_MAINTENANCE">Em Manutenção</SelectItem>
                  <SelectItem value="DECOMMISSIONED">Desativado</SelectItem>
                </SelectContent>
              </Select>
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
