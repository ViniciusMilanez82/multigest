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

export default function DriverDetailPage() {
  const router = useRouter(); const params = useParams();
  const [driver, setDriver] = useState<any>(null); const [loading, setLoading] = useState(true);

  useEffect(() => { api.get(`/fleet/drivers/${params.id}`).then(r => setDriver(r.data)).catch(() => { toast.error("Não encontrado"); router.push("/dashboard/drivers"); }).finally(() => setLoading(false)); }, []);
  async function handleDelete() { try { await api.delete(`/fleet/drivers/${params.id}`); toast.success("Excluído"); router.push("/dashboard/drivers"); } catch (e: any) { toast.error(e.response?.data?.message || "Erro"); } }

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  if (!driver) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/drivers")}><ArrowLeft className="h-5 w-5" /></Button><div><h1 className="text-2xl font-bold">{driver.name}</h1><p className="text-muted-foreground">CNH: {driver.cnh}</p></div></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/drivers/${driver.id}/editar`)}><Edit className="mr-2 h-4 w-4" /> Editar</Button>
          <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Excluir {driver.name}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Informações</CardTitle></CardHeader><CardContent className="space-y-3">
          <div className="flex justify-between"><span className="text-muted-foreground">CPF</span><span className="font-mono">{driver.cpf}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">CNH</span><span className="font-mono">{driver.cnh}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Categoria</span><span>{driver.cnhCategory}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Validade CNH</span><span>{new Date(driver.cnhExpiry).toLocaleDateString("pt-BR")}</span></div>
          {driver.phone && <div className="flex justify-between"><span className="text-muted-foreground">Telefone</span><span>{driver.phone}</span></div>}
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={driver.isActive ? "default" : "secondary"}>{driver.isActive ? "Ativo" : "Inativo"}</Badge></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Veículos Associados</CardTitle></CardHeader><CardContent>
          {(!driver.vehicles || driver.vehicles.length === 0) ? <p className="text-sm text-muted-foreground">Nenhum veículo</p> : driver.vehicles.map((v: any) => (
            <div key={v.id} className="border-b pb-2 mb-2 cursor-pointer hover:bg-muted/50 p-2 rounded" onClick={() => router.push(`/dashboard/fleet/${v.id}`)}>
              <p className="font-medium text-sm">{v.plate} - {v.brand} {v.model}</p>
            </div>
          ))}
        </CardContent></Card>
      </div>
    </div>
  );
}
