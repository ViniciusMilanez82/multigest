"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function SupplierDetailPage() {
  const router = useRouter(); const params = useParams();
  const [supplier, setSupplier] = useState<any>(null); const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSupplier(); }, []);
  async function fetchSupplier() { try { const r = await api.get(`/api/suppliers/${params.id}`); setSupplier(r.data); } catch { toast.error("Fornecedor não encontrado"); router.push("/dashboard/suppliers"); } finally { setLoading(false); } }
  async function handleDelete() { try { await api.delete(`/api/suppliers/${params.id}`); toast.success("Fornecedor excluído"); router.push("/dashboard/suppliers"); } catch (e: any) { toast.error(e.response?.data?.message || "Erro"); } }

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  if (!supplier) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/suppliers")}><ArrowLeft className="h-5 w-5" /></Button><div><h1 className="text-2xl font-bold">{supplier.razaoSocial}</h1><p className="text-muted-foreground">{supplier.nomeFantasia || supplier.cpfCnpj}</p></div></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/suppliers/${supplier.id}/editar`)}><Edit className="mr-2 h-4 w-4" /> Editar</Button>
          <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Excluir {supplier.razaoSocial}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Informações</CardTitle></CardHeader><CardContent className="space-y-3">
          <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><Badge variant="outline">{supplier.type === "JURIDICA" ? "Pessoa Jurídica" : "Pessoa Física"}</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">CPF/CNPJ</span><span className="font-mono">{supplier.cpfCnpj}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Razão Social</span><span>{supplier.razaoSocial}</span></div>
          {supplier.nomeFantasia && <div className="flex justify-between"><span className="text-muted-foreground">Nome Fantasia</span><span>{supplier.nomeFantasia}</span></div>}
          {supplier.category && <div className="flex justify-between"><span className="text-muted-foreground">Categoria</span><span>{supplier.category}</span></div>}
          {supplier.notes && <div className="pt-2 border-t"><p className="text-sm text-muted-foreground">{supplier.notes}</p></div>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Contatos</CardTitle></CardHeader><CardContent>
          {(!supplier.contacts || supplier.contacts.length === 0) ? <p className="text-sm text-muted-foreground">Nenhum contato</p> : supplier.contacts.map((c: any) => (
            <div key={c.id} className="border-b pb-2 mb-2"><p className="font-medium text-sm">{c.name} {c.role ? `(${c.role})` : ""}</p>{c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}{c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}</div>
          ))}
        </CardContent></Card>
      </div>
    </div>
  );
}
