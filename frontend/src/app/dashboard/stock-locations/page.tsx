"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MapPin, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StockLocation {
  id: string;
  name: string;
  address: string | null;
  customerId: string | null;
  customer: { id: string; razaoSocial: string; nomeFantasia: string | null; cpfCnpj: string } | null;
  _count: { assetsHere: number };
}

interface Customer {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cpfCnpj: string;
}

export default function StockLocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({ name: "", address: "", customerId: "" });

  useEffect(() => { fetchLocations(); }, [search]);
  useEffect(() => {
    api.get("/customers", { params: { limit: 500 } }).then(r => {
      const data = r.data;
      setCustomers(Array.isArray(data) ? data : data?.data || []);
    }).catch(() => setCustomers([]));
  }, []);

  async function fetchLocations() {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      const res = await api.get("/stock-locations", { params });
      setLocations(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch { toast.error("Erro ao carregar locais"); } finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { toast.error("Nome é obrigatório"); return; }
    try {
      setSaving(true);
      const payload: any = { name: form.name };
      if (form.address) payload.address = form.address;
      if (form.customerId && form.customerId !== "none") payload.customerId = form.customerId;
      await api.post("/stock-locations", payload);
      toast.success("Local criado!");
      setDialogOpen(false);
      setForm({ name: "", address: "", customerId: "" });
      fetchLocations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/stock-locations/${id}`);
      toast.success("Local removido");
      fetchLocations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao remover");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Locais de Estoque</h1>
          <p className="text-muted-foreground">Pátios, depósitos e clientes onde os containers ficam</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Novo Local</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Local de Estoque</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome *</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Pátio Central, Depósito Sul..." />
              </div>
              <div>
                <label className="text-sm font-medium">Endereço</label>
                <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Rua, número, cidade" />
              </div>
              <div>
                <label className="text-sm font-medium">Vincular a Cliente (opcional)</label>
                <Select value={form.customerId || "none"} onValueChange={v => setForm(f => ({ ...f, customerId: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione (se for um local do cliente)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum — local próprio</SelectItem>
                    {(customers || []).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nomeFantasia || c.razaoSocial} - {c.cpfCnpj}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Criar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar locais..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : locations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum local cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map(loc => (
            <Card key={loc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {loc.name}
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(loc.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {loc.address && <p className="text-sm text-muted-foreground">{loc.address}</p>}
                {loc.customer && (
                  <Badge variant="outline" className="text-xs">
                    Cliente: {loc.customer.nomeFantasia || loc.customer.razaoSocial}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{loc._count.assetsHere} container(s) aqui</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
