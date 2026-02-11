"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Subfamily {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  assetType?: { id: string; name: string };
}

interface Family {
  id: string;
  name: string;
}

interface AssetType {
  id: string;
  name: string;
}

export default function SubfamiliasPage() {
  const router = useRouter();
  const params = useParams();
  const familyId = params.id as string;
  const [family, setFamily] = useState<Family | null>(null);
  const [subfamilies, setSubfamilies] = useState<Subfamily[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    assetTypeId: "",
    sortOrder: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [famRes, subRes, typesRes] = await Promise.all([
        api.get(`/item-families/${familyId}`),
        api.get(`/item-families/${familyId}/subfamilies`),
        api.get("/asset-types"),
      ]);
      setFamily(famRes.data);
      setSubfamilies(Array.isArray(subRes.data) ? subRes.data : []);
      setAssetTypes(Array.isArray(typesRes.data) ? typesRes.data : []);
    } catch {
      toast.error("Erro ao carregar dados");
      router.push("/dashboard/item-families");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [familyId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/item-families/${familyId}/subfamilies`, {
        name: form.name.trim(),
        assetTypeId: form.assetTypeId || undefined,
        sortOrder: form.sortOrder,
      });
      toast.success("Subfamília cadastrada!");
      setForm({ name: "", assetTypeId: "", sortOrder: 0 });
      setDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao cadastrar. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !family) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/item-families")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Subfamílias de {family.name}</h2>
            <p className="text-muted-foreground mt-1">
              Ex: Container 20&apos;, Módulo 3x6
            </p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Subfamília
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista</CardTitle>
          <CardDescription>Vincule subfamílias a tipos de ativo para conversão em contrato</CardDescription>
        </CardHeader>
        <CardContent>
          {subfamilies.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              Nenhuma subfamília. Clique em &quot;Nova Subfamília&quot; para adicionar.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo de Ativo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subfamilies.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      {s.assetType?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          s.isActive ? "text-green-600" : "text-muted-foreground"
                        }
                      >
                        {s.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/dashboard/item-families/subfamilias/${s.id}/editar`
                          )
                        }
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Subfamília</DialogTitle>
            <DialogDescription>
              Cadastre uma subfamília para a família {family.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Ex: Container 20'"
                required
              />
            </div>
            <div>
              <Label htmlFor="assetType">Tipo de Ativo (opcional)</Label>
              <Select
                value={form.assetTypeId}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, assetTypeId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {assetTypes.map((at) => (
                    <SelectItem key={at.id} value={at.id}>
                      {at.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sortOrder">Ordem</Label>
              <Input
                id="sortOrder"
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    sortOrder: parseInt(e.target.value || "0", 10),
                  }))
                }
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
