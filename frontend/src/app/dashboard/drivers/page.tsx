"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User } from "lucide-react";
import { toast } from "sonner";

interface Driver { id: string; name: string; cpf: string; cnh: string; cnhCategory: string; cnhExpiry: string; phone: string | null; isActive: boolean; }

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(); }, [search]);
  async function fetch() { try { setLoading(true); const p: any = {}; if (search) p.search = search; const r = await api.get("/api/fleet/drivers", { params: p }); setDrivers(Array.isArray(r.data) ? r.data : r.data.data || []); } catch { toast.error("Erro ao carregar dados"); } finally { setLoading(false); } }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Motoristas</h1><p className="text-muted-foreground">{drivers.length} motorista(s)</p></div>
        <Button onClick={() => router.push("/dashboard/drivers/novo")}><Plus className="mr-2 h-4 w-4" /> Novo Motorista</Button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
      {loading ? <div className="text-center py-12 text-muted-foreground">Carregando...</div> : drivers.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><User className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhum motorista</p></CardContent></Card>
      ) : (
        <div className="rounded-md border overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50"><th className="px-4 py-3 text-left font-medium">Nome</th><th className="px-4 py-3 text-left font-medium">CPF</th><th className="px-4 py-3 text-left font-medium">CNH</th><th className="px-4 py-3 text-left font-medium">Categoria</th><th className="px-4 py-3 text-left font-medium">Validade CNH</th><th className="px-4 py-3 text-left font-medium">Telefone</th><th className="px-4 py-3 text-left font-medium">Status</th></tr></thead>
        <tbody>{drivers.map(d => (
          <tr key={d.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/dashboard/drivers/${d.id}`)}>
            <td className="px-4 py-3 font-medium">{d.name}</td><td className="px-4 py-3 font-mono text-xs">{d.cpf}</td><td className="px-4 py-3 font-mono text-xs">{d.cnh}</td><td className="px-4 py-3">{d.cnhCategory}</td>
            <td className="px-4 py-3">{new Date(d.cnhExpiry).toLocaleDateString("pt-BR")}</td><td className="px-4 py-3">{d.phone || "—"}</td>
            <td className="px-4 py-3"><Badge variant={d.isActive ? "default" : "secondary"}>{d.isActive ? "Ativo" : "Inativo"}</Badge></td>
          </tr>))}</tbody></table></div>
      )}
    </div>
  );
}
