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

interface Customer {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
}

export default function EditarContratoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    customerId: "",
    contractNumber: "",
    startDate: "",
    endDate: "",
    paymentTerms: "",
    paymentMethod: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCustomers = useCallback(async () => {
    try {
      const { data } = await api.get("/customers");
      setCustomers(Array.isArray(data) ? data : data.data || []);
    } catch {
      setCustomers([]);
    }
  }, []);

  const fetchContract = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/contracts/${id}`);
      setForm({
        customerId: data.customerId || data.customer?.id || "",
        contractNumber: data.contractNumber || "",
        startDate: data.startDate ? data.startDate.split("T")[0] : "",
        endDate: data.endDate ? data.endDate.split("T")[0] : "",
        paymentTerms: data.paymentTerms || "",
        paymentMethod: data.paymentMethod || "",
        notes: data.notes || "",
      });
    } catch {
      toast.error("Erro ao carregar contrato.");
      router.push("/dashboard/contracts");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCustomers();
    fetchContract();
  }, [fetchCustomers, fetchContract]);

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
        startDate: form.startDate,
      };

      if (form.endDate) payload.endDate = form.endDate;
      if (form.paymentTerms.trim())
        payload.paymentTerms = form.paymentTerms.trim();
      if (form.paymentMethod) payload.paymentMethod = form.paymentMethod;
      if (form.notes.trim()) payload.notes = form.notes.trim();

      await api.patch(`/contracts/${id}`, payload);
      toast.success("Contrato atualizado com sucesso!");
      router.push(`/dashboard/contracts/${id}`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Erro ao atualizar contrato. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Carregando contrato...</span>
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
          onClick={() => router.push(`/dashboard/contracts/${id}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editar Contrato</h2>
          <p className="text-gray-500 mt-1">
            Atualize os dados do contrato{" "}
            <strong>{form.contractNumber}</strong>
          </p>
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
                  onChange={(e) =>
                    handleChange("contractNumber", e.target.value)
                  }
                  className={errors.contractNumber ? "border-red-500" : ""}
                />
                {errors.contractNumber && (
                  <p className="text-sm text-red-500">
                    {errors.contractNumber}
                  </p>
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
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <p className="text-sm text-red-500">{errors.customerId}</p>
                )}
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

          {/* Pagamento */}
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
                  onChange={(e) =>
                    handleChange("paymentTerms", e.target.value)
                  }
                  placeholder="Ex: 30 dias"
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
            onClick={() => router.push(`/dashboard/contracts/${id}`)}
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
