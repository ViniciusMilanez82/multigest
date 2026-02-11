"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NovaFamiliaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sortOrder: 0,
    isActive: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/item-families", {
        name: form.name.trim(),
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      });
      toast.success("Família cadastrada!");
      router.push("/dashboard/item-families");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao cadastrar. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <h2 className="text-2xl font-bold">Nova Família</h2>
          <p className="text-muted-foreground mt-1">
            Ex: Marítimo, Módulo, Acessórios
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Dados da Família</CardTitle>
            <CardDescription>Agrupa subfamílias de itens para propostas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Marítimo"
                required
              />
            </div>
            <div>
              <Label htmlFor="sortOrder">Ordem</Label>
              <Input
                id="sortOrder"
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sortOrder: parseInt(e.target.value || "0", 10) }))
                }
              />
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
