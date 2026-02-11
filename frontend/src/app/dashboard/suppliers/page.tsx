"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Factory } from "lucide-react";
import { toast } from "sonner";

interface Supplier { id: string; razaoSocial: string; nomeFantasia: string | null; cpfCnpj: string; category: string | null; type: string; }

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(); }, [search]);

  async function fetch() {
    try { setLoading(true); const p: any = {}; if (search) p.search = search; const r = await api.get("/suppliers", { params: p }); setSuppliers(Array.isArray(r.data) ? r.data : r.data.data || []); } catch { toast.error("Erro ao carregar dados"); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Fornecedores</h1><p className="text-muted-foreground">{suppliers.length} fornecedor(es)</p></div>
        <Button onClick={() => router.push("/dashboard/suppliers/novo")}><Plus className="mr-2 h-4 w-4" /> Novo Fornecedor</Button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
      {loading ? <div className="text-center py-12 text-muted-foreground">Carregando...</div> : suppliers.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><Factory className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhum fornecedor</p></CardContent></Card>
      ) : (
        <div className="rounded-md border overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50"><th className="px-4 py-3 text-left font-medium">Razão Social</th><th className="px-4 py-3 text-left font-medium">Nome Fantasia</th><th className="px-4 py-3 text-left font-medium">CPF/CNPJ</th><th className="px-4 py-3 text-left font-medium">Tipo</th><th className="px-4 py-3 text-left font-medium">Categoria</th></tr></thead>
        <tbody>{suppliers.map(s => (
          <tr key={s.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/dashboard/suppliers/${s.id}`)}>
            <td className="px-4 py-3 font-medium">{s.razaoSocial}</td><td className="px-4 py-3">{s.nomeFantasia || "—"}</td><td className="px-4 py-3 font-mono">{s.cpfCnpj}</td>
            <td className="px-4 py-3"><Badge variant="outline">{s.type === "JURIDICA" ? "PJ" : "PF"}</Badge></td><td className="px-4 py-3">{s.category || "—"}</td>
          </tr>))}</tbody></table></div>
      )}
    </div>
  );
}
