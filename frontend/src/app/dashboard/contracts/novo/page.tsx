"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
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

interface Asset {
  id: string;
  code: string;
  dailyRate?: number | string;
  assetType?: { name: string };
}

interface ItemForm {
  assetId: string;
  dailyRate: string;
  monthlyRate: string;
  startDate: string;
  notes: string;
}

export default function NovoContratoPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    customerId: "",
    contractNumber: "",
    type: "MEDICAO",
    status: "DRAFT",
    startDate: "",
    endDate: "",
    paymentTerms: "",
    paymentMethod: "",
    notes: "",
  });

  const [items, setItems] = useState<ItemForm[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCustomers = useCallback(async () => {
    try {
      const { data } = await api.get("/customers");
      setCustomers(Array.isArray(data) ? data : data.data || []);
    } catch {
      setCustomers([]);
    }
  }, []);

  const fetchAssets = useCallback(async () => {
    try {
      const { data } = await api.get("/assets", {
        params: { status: "AVAILABLE", limit: 100 },
      });
      setAssets(data.data || []);
    } catch {
      setAssets([]);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchAssets();
  }, [fetchCustomers, fetchAssets]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        assetId: "",
        dailyRate: "",
        monthlyRate: "",
        startDate: form.startDate,
        notes: "",
      },
    ]);
  }

  function updateItem(index: number, field: string, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAssetSelect(index: number, assetId: string) {
    const asset = assets.find((a) => a.id === assetId);
    const dailyRate = asset?.dailyRate
      ? String(typeof asset.dailyRate === "string" ? parseFloat(asset.dailyRate) : asset.dailyRate)
      : "";
    updateItem(index, "assetId", assetId);
    if (dailyRate) updateItem(index, "dailyRate", dailyRate);
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.customerId) newErrors.customerId = "Cliente é obrigatório";
    if (!form.contractNumber.trim())
      newErrors.contractNumber = "Número do contrato é obrigatório";
    if (!form.startDate) newErrors.startDate = "Data de início é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        customerId: form.customerId,
        contractNumber: form.contractNumber.trim(),
        type: form.type,
        status: form.status,
        startDate: form.startDate,
      };

      if (form.endDate) payload.endDate = form.endDate;
      if (form.paymentTerms.trim()) payload.paymentTerms = form.paymentTerms.trim();
      if (form.paymentMethod.trim()) payload.paymentMethod = form.paymentMethod.trim();
      if (form.notes.trim()) payload.notes = form.notes.trim();

      const validItems = items.filter((item) => item.assetId && item.dailyRate);
      if (validItems.length > 0) {
        payload.items = validItems.map((item) => ({
          assetId: item.assetId,
          dailyRate: parseFloat(item.dailyRate),
          monthlyRate: item.monthlyRate ? parseFloat(item.monthlyRate) : undefined,
          startDate: item.startDate || form.startDate,
          notes: item.notes || undefined,
        }));
      }

      await api.post("/contracts", payload);
      toast.success("Contrato criado com sucesso!");
      router.push("/dashboard/contracts");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao criar contrato. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/contracts")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Novo Contrato</h2>
          <p className="text-gray-500 mt-1">Crie um novo contrato de locação</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados do Contrato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Contrato</CardTitle>
              <CardDescription>Informações básicas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contractNumber">Nº do Contrato *</Label>
                <Input
                  id="contractNumber"
                  value={form.contractNumber}
                  onChange={(e) => handleChange("contractNumber", e.target.value)}
                  placeholder="Ex: CTR-2026-001"
                  className={errors.contractNumber ? "border-red-500" : ""}
                />
                {errors.contractNumber && (
                  <p className="text-sm text-red-500">{errors.contractNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerId">Cliente *</Label>
                <Select
                  value={form.customerId}
                  onValueChange={(v) => handleChange("customerId", v)}
                >
                  <SelectTrigger
                    id="customerId"
                    className={`w-full ${errors.customerId ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.razaoSocial}
                        {c.nomeFantasia ? ` (${c.nomeFantasia})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <p className="text-sm text-red-500">{errors.customerId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Contrato *</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => handleChange("type", v)}
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEDICAO">Medição (dias de uso)</SelectItem>
                    <SelectItem value="ANTECIPADO">Antecipado (paga antes)</SelectItem>
                    <SelectItem value="AUTOMATICO">Automático (mensal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => handleChange("status", v)}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Rascunho</SelectItem>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Início *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    className={errors.startDate ? "border-red-500" : ""}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-500">{errors.startDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Fim</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pagamento e Obs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pagamento</CardTitle>
              <CardDescription>Condições de pagamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
                <Input
                  id="paymentTerms"
                  value={form.paymentTerms}
                  onChange={(e) => handleChange("paymentTerms", e.target.value)}
                  placeholder="Ex: 30 dias, todo dia 15..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                <Select
                  value={form.paymentMethod}
                  onValueChange={(v) => handleChange("paymentMethod", v)}
                >
                  <SelectTrigger id="paymentMethod" className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Cartão">Cartão</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Observações sobre o contrato..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Itens do Contrato */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Itens do Contrato</CardTitle>
                <CardDescription>Ativos incluídos na locação</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                Nenhum item adicionado. Clique em &quot;Adicionar Item&quot; para
                incluir ativos no contrato.
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg border bg-gray-50"
                  >
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Ativo</Label>
                      <Select
                        value={item.assetId}
                        onValueChange={(v) => handleAssetSelect(index, v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o ativo" />
                        </SelectTrigger>
                        <SelectContent>
                          {assets.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.code}
                              {a.assetType ? ` — ${a.assetType.name}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full sm:w-32 space-y-2">
                      <Label className="text-xs">Diária (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.dailyRate}
                        onChange={(e) =>
                          updateItem(index, "dailyRate", e.target.value)
                        }
                        placeholder="0,00"
                      />
                    </div>
                    <div className="w-full sm:w-32 space-y-2">
                      <Label className="text-xs">Mensal (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.monthlyRate}
                        onChange={(e) =>
                          updateItem(index, "monthlyRate", e.target.value)
                        }
                        placeholder="0,00"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/contracts")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvar Contrato
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
