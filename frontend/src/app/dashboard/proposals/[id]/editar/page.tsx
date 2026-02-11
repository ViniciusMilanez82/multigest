"use client";

import { useEffect, useState, useCallback } from "react";
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
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
}

interface ProposalItem {
  tipo: string;
  modelo: string;
  quantidade: number;
  valorUnitario: number;
  frete?: number;
}

export default function EditarPropostaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    type: "LOCACAO" as "VENDA" | "LOCACAO" | "EVENTO",
    customerId: "",
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
  });

  const [items, setItems] = useState<ProposalItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCustomers = useCallback(async () => {
    try {
      const { data } = await api.get("/customers", { params: { limit: 500 } });
      setCustomers(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setCustomers([]);
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [propRes, custRes] = await Promise.all([
          api.get(`/proposals/${id}`),
          api.get("/customers", { params: { limit: 500 } }),
        ]);
        const p = propRes.data;
        setCustomers(Array.isArray(custRes.data) ? custRes.data : custRes.data?.data || []);

        setForm({
          type: p.type || "LOCACAO",
          customerId: p.customerId || "",
          companyName: p.companyName || "",
          contactName: p.contactName || "",
          phone: p.phone || "",
          email: p.email || "",
        });
        setItems(
          Array.isArray(p.items) && p.items.length > 0
            ? p.items.map((i: any) => ({
                tipo: i.tipo || "maritimo",
                modelo: i.modelo || "",
                quantidade: i.quantidade ?? 1,
                valorUnitario: i.valorUnitario ?? 0,
                frete: i.frete,
              }))
            : [{ tipo: "maritimo", modelo: "", quantidade: 1, valorUnitario: 0 }]
        );
      } catch {
        toast.error("Proposta não encontrada");
        router.push("/dashboard/proposals");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function updateItem(index: number, field: keyof ProposalItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { tipo: "maritimo", modelo: "", quantidade: 1, valorUnitario: 0 },
    ]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = items.filter(
      (i) => i.modelo?.trim() && i.quantidade > 0 && i.valorUnitario > 0
    );
    if (valid.length === 0) {
      setErrors({ items: "Adicione ao menos um item válido" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        type: form.type,
        items: valid.map((i) => ({
          tipo: i.tipo,
          modelo: i.modelo,
          quantidade: i.quantidade,
          valorUnitario: i.valorUnitario,
          frete: i.frete || undefined,
        })),
      };
      if (form.customerId) payload.customerId = form.customerId;
      else {
        payload.companyName = form.companyName?.trim();
        payload.contactName = form.contactName?.trim();
        payload.phone = form.phone?.trim();
        payload.email = form.email?.trim();
      }

      await api.put(`/proposals/${id}`, payload);
      toast.success("Proposta atualizada");
      router.push(`/dashboard/proposals/${id}`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao salvar. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/proposals/${id}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Editar Proposta</h2>
          <p className="text-gray-500 mt-1">Altere os dados da proposta</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => handleChange("type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VENDA">Venda</SelectItem>
                    <SelectItem value="LOCACAO">Locação</SelectItem>
                    <SelectItem value="EVENTO">Evento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  value={form.customerId}
                  onValueChange={(v) => handleChange("customerId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Informar abaixo</SelectItem>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.razaoSocial}
                        {c.nomeFantasia ? ` (${c.nomeFantasia})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Empresa / Razão Social</Label>
                <Input
                  value={form.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Nome da empresa"
                  disabled={!!form.customerId}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Contato</Label>
                  <Input
                    value={form.contactName}
                    onChange={(e) => handleChange("contactName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Itens</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-wrap gap-3 p-4 rounded-lg border bg-gray-50"
                >
                  <div className="flex-1 min-w-[80px] space-y-2">
                    <Label className="text-xs">Tipo</Label>
                    <Select
                      value={item.tipo}
                      onValueChange={(v) => updateItem(i, "tipo", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maritimo">Marítimo</SelectItem>
                        <SelectItem value="modulo">Módulo</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[120px] space-y-2">
                    <Label className="text-xs">Modelo</Label>
                    <Input
                      value={item.modelo}
                      onChange={(e) => updateItem(i, "modelo", e.target.value)}
                    />
                  </div>
                  <div className="w-20 space-y-2">
                    <Label className="text-xs">Qtd</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantidade}
                      onChange={(e) =>
                        updateItem(i, "quantidade", parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="w-28 space-y-2">
                    <Label className="text-xs">Unit. (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.valorUnitario || ""}
                      onChange={(e) =>
                        updateItem(i, "valorUnitario", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label className="text-xs">Frete</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.frete ?? ""}
                      onChange={(e) =>
                        updateItem(i, "frete", parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(i)}
                      disabled={items.length <= 1}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {errors.items && (
                <p className="text-sm text-red-500">{errors.items}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/proposals/${id}`)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
