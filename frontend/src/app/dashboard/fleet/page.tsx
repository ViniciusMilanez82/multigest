"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Truck, Eye } from "lucide-react";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  plate: string;
  type: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  currentKm: number | null;
  status: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  AVAILABLE: { label: "Disponível", variant: "default" },
  IN_OPERATION: { label: "Em Operação", variant: "secondary" },
  IN_MAINTENANCE: { label: "Em Manutenção", variant: "destructive" },
  DECOMMISSIONED: { label: "Desativado", variant: "outline" },
};

export default function FleetPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, [search, status]);

  async function fetchVehicles() {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await api.get("/vehicles", { params });
      setVehicles(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Frota</h1>
          <p className="text-muted-foreground">{total} veículo(s) cadastrado(s)</p>
        </div>
        <Button onClick={() => router.push("/dashboard/fleet/novo")}>
          <Plus className="mr-2 h-4 w-4" /> Novo Veículo
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa, marca, modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v === "ALL" ? "" : v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="AVAILABLE">Disponível</SelectItem>
            <SelectItem value="IN_OPERATION">Em Operação</SelectItem>
            <SelectItem value="IN_MAINTENANCE">Em Manutenção</SelectItem>
            <SelectItem value="DECOMMISSIONED">Desativado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum veículo encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <Card key={v.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/dashboard/fleet/${v.id}`)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-mono">{v.plate}</CardTitle>
                  <Badge variant={statusMap[v.status]?.variant || "outline"}>
                    {statusMap[v.status]?.label || v.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Tipo:</span> {v.type}</p>
                  {v.brand && <p><span className="text-muted-foreground">Marca:</span> {v.brand} {v.model}</p>}
                  {v.year && <p><span className="text-muted-foreground">Ano:</span> {v.year}</p>}
                  {v.currentKm != null && <p><span className="text-muted-foreground">KM:</span> {v.currentKm.toLocaleString("pt-BR")} km</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
