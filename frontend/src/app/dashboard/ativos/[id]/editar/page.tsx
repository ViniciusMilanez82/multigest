"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AssetType {
  id: string;
  name: string;
}

const CONDITION_OPTIONS = [
  { value: "EXCELLENT", label: "Excelente" },
  { value: "GOOD", label: "Bom" },
  { value: "FAIR", label: "Regular" },
  { value: "POOR", label: "Ruim" },
];

export default function EditarAtivoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    assetTypeId: "",
    code: "",
    serialNumber: "",
    manufacturer: "",
    yearManufactured: "",
    width: "",
    height: "",
    length: "",
    condition: "",
    currentLocation: "",
    dailyRate: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchAssetTypes = useCallback(async () => {
    try {
      const { data } = await api.get("/asset-types");
      setAssetTypes(Array.isArray(data) ? data : data.data || []);
    } catch {
      setAssetTypes([]);
    }
  }, []);

  const fetchAsset = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/assets/${id}`);
      setForm({
        assetTypeId: data.assetTypeId || data.assetType?.id || "",
        code: data.code || "",
        serialNumber: data.serialNumber || "",
        manufacturer: data.manufacturer || "",
        yearManufactured: data.yearManufactured ? String(data.yearManufactured) : "",
        width: data.width ? String(data.width) : "",
        height: data.height ? String(data.height) : "",
        length: data.length ? String(data.length) : "",
        condition: data.condition || "",
        currentLocation: data.currentLocation || "",
        dailyRate: data.dailyRate ? String(data.dailyRate) : "",
        notes: data.notes || "",
      });
    } catch {
      toast.error("Erro ao carregar ativo.");
      router.push("/dashboard/ativos");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchAssetTypes();
    fetchAsset();
  }, [fetchAssetTypes, fetchAsset]);

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

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.assetTypeId) newErrors.assetTypeId = "Tipo é obrigatório";
    if (!form.code.trim()) newErrors.code = "Código é obrigatório";
    if (!form.condition) newErrors.condition = "Condição é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        assetTypeId: form.assetTypeId,
        code: form.code.trim(),
        condition: form.condition,
      };

      if (form.serialNumber.trim()) payload.serialNumber = form.serialNumber.trim();
      if (form.manufacturer.trim()) payload.manufacturer = form.manufacturer.trim();
      if (form.yearManufactured) payload.yearManufactured = parseInt(form.yearManufactured);
      if (form.width) payload.width = parseFloat(form.width);
      if (form.height) payload.height = parseFloat(form.height);
      if (form.length) payload.length = parseFloat(form.length);
      if (form.currentLocation.trim()) payload.currentLocation = form.currentLocation.trim();
      if (form.dailyRate) payload.dailyRate = parseFloat(form.dailyRate.replace(",", "."));
      if (form.notes.trim()) payload.notes = form.notes.trim();

      await api.patch(`/assets/${id}`, payload);
      toast.success("Ativo atualizado com sucesso!");
      router.push(`/dashboard/ativos/${id}`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao atualizar ativo. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Carregando ativo...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/ativos/${id}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editar Ativo</h2>
          <p className="text-gray-500 mt-1">
            Atualize as informações do ativo <strong>{form.code}</strong>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
              <CardDescription>Dados principais do ativo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assetTypeId">Tipo *</Label>
                <Select
                  value={form.assetTypeId}
                  onValueChange={(v) => handleChange("assetTypeId", v)}
                >
                  <SelectTrigger
                    id="assetTypeId"
                    className={`w-full ${errors.assetTypeId ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assetTypeId && (
                  <p className="text-sm text-red-500">{errors.assetTypeId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                  placeholder="Ex: CONT-001"
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber">Número de Série</Label>
                <Input
                  id="serialNumber"
                  value={form.serialNumber}
                  onChange={(e) => handleChange("serialNumber", e.target.value)}
                  placeholder="Ex: SN-123456"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Fabricante</Label>
                  <Input
                    id="manufacturer"
                    value={form.manufacturer}
                    onChange={(e) => handleChange("manufacturer", e.target.value)}
                    placeholder="Ex: CIMC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearManufactured">Ano Fabricação</Label>
                  <Input
                    id="yearManufactured"
                    type="number"
                    value={form.yearManufactured}
                    onChange={(e) => handleChange("yearManufactured", e.target.value)}
                    placeholder="Ex: 2024"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condição *</Label>
                <Select
                  value={form.condition}
                  onValueChange={(v) => handleChange("condition", v)}
                >
                  <SelectTrigger
                    id="condition"
                    className={`w-full ${errors.condition ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Selecione a condição" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.condition && (
                  <p className="text-sm text-red-500">{errors.condition}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dimensões e Localização */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dimensões e Localização</CardTitle>
              <CardDescription>
                Medidas físicas e informações adicionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="width">Largura (m)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.01"
                    value={form.width}
                    onChange={(e) => handleChange("width", e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (m)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    value={form.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length">Comprimento (m)</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.01"
                    value={form.length}
                    onChange={(e) => handleChange("length", e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentLocation">Localização Atual</Label>
                <Input
                  id="currentLocation"
                  value={form.currentLocation}
                  onChange={(e) => handleChange("currentLocation", e.target.value)}
                  placeholder="Ex: Pátio Central - São Paulo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyRate">Valor Diário (R$)</Label>
                <Input
                  id="dailyRate"
                  type="number"
                  step="0.01"
                  value={form.dailyRate}
                  onChange={(e) => handleChange("dailyRate", e.target.value)}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Informações adicionais sobre o ativo..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/ativos/${id}`)}
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
                Salvar Alterações
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
