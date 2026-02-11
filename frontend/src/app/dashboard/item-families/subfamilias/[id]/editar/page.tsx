"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditarSubfamiliaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    assetTypeId: "",
    sortOrder: 0,
    isActive: true,
  });
  const [assetTypes, setAssetTypes] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    Promise.all([
      api.get(`/item-subfamilies/${id}`),
      api.get("/asset-types"),
    ])
      .then(([subRes, typesRes]) => {
        const s = subRes.data;
        setForm({
          name: s.name,
          assetTypeId: s.assetType?.id ?? "",
          sortOrder: s.sortOrder ?? 0,
          isActive: s.isActive ?? true,
        });
        setAssetTypes(Array.isArray(typesRes.data) ? typesRes.data : []);
      })
      .catch(() => {
        toast.error("Subfamília não encontrada");
        router.push("/dashboard/item-families");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put(`/item-subfamilies/${id}`, {
        name: form.name.trim(),
        assetTypeId: form.assetTypeId || undefined,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      });
      toast.success("Subfamília atualizada!");
      router.push("/dashboard/item-families");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao atualizar. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <h2 className="text-2xl font-bold">Editar Subfamília</h2>
          <p className="text-muted-foreground mt-1">{form.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Dados da Subfamília</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label>Tipo de Ativo (opcional)</Label>
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isActive: e.target.checked }))
                }
                className="rounded"
              />
              <Label htmlFor="isActive">Ativo</Label>
            </div>
            <div className="flex gap-4 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/item-families")}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
