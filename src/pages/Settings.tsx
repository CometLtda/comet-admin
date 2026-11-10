import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, RefreshCw, Sparkles, TrendingDown, TrendingUp, WandSparkles } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiService, ExchangeRate } from "@/services/api";
import toast from "react-hot-toast";

type AiVersion = 0 | 1;

const AI_OPTIONS: { version: AiVersion; name: string; description: string; icon: typeof Sparkles }[] = [
  { version: 1, name: "Nova", description: "A nova experiência de inteligência artificial.", icon: Sparkles },
  { version: 0, name: "Legacy", description: "A experiência clássica de inteligência artificial.", icon: WandSparkles },
];

const CURRENCY_NAMES: Record<number, string> = {
  0: "Dólar Americano",
  1: "Real Brasileiro",
  2: "Euro",
  3: "Libra Esterlina",
  4: "Peso Argentino",
  5: "Peso Colombiano",
  6: "Dólar Canadense",
  7: "Dólar Australiano",
};

const formatExchangeRate = (value: number, code: string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: code, minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(value);

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [pendingVersion, setPendingVersion] = useState<AiVersion | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingRate, setPendingRate] = useState<ExchangeRate | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["ai-interface"],
    queryFn: () => apiService.getAiInterface(),
  });

  const canConfirm = /confirm/i.test(confirmation);
  const { data: exchangeRates, isLoading: ratesLoading, isError: ratesError } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: () => apiService.getExchangeRates(),
  });

  const handleChange = async () => {
    if (pendingVersion === null || !canConfirm) return;
    setSaving(true);
    try {
      await apiService.setAiInterface(pendingVersion);
      queryClient.setQueryData(["ai-interface"], { version: pendingVersion });
      toast.success("IA ativa atualizada com sucesso.");
      setPendingVersion(null);
      setConfirmation("");
    } catch {
      // O serviço já exibe uma notificação em caso de erro.
    } finally {
      setSaving(false);
    }
  };

  const closeDialog = (open: boolean) => {
    if (!open && !saving) {
      setPendingVersion(null);
      setConfirmation("");
    }
  };

  const handleRefreshRate = async () => {
    if (!pendingRate) return;
    setRefreshing(true);
    try {
      const updatedRate = await apiService.refreshExchangeRate(pendingRate.currency);
      queryClient.setQueryData<ExchangeRate[]>(["exchange-rates"], (rates) =>
        rates?.map((rate) => rate.currency === updatedRate.currency ? updatedRate : rate)
      );
      toast.success(`Cotação ${updatedRate.code}/${updatedRate.codeIn} atualizada com sucesso.`);
      setPendingRate(null);
    } catch {
      // O serviço já exibe uma notificação em caso de erro.
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações da plataforma.</p>
        </div>

        <Card className="glass-strong shadow-modern">
          <CardHeader>
            <CardTitle>Inteligência artificial</CardTitle>
            <CardDescription>Escolha qual versão da IA ficará ativa para a plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10" role="status" aria-label="Carregando configuração">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : isError || !data || (data.version !== 0 && data.version !== 1) ? (
              <div className="py-8 text-center text-sm text-destructive">
                Não foi possível carregar a configuração da IA. Atualize a página para tentar novamente.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {AI_OPTIONS.map(({ version, name, description, icon: Icon }) => {
                  const active = data.version === version;
                  return (
                    <div key={version} className={`rounded-lg border p-5 transition-colors ${active ? "border-primary bg-primary/5" : "border-border"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="rounded-md bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></span>
                          <div>
                            <h3 className="font-semibold">{name}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                          </div>
                        </div>
                        {active && <Badge className="shrink-0"><Check className="mr-1 h-3 w-3" />Ativa</Badge>}
                      </div>
                      {!active && (
                        <Button className="mt-5 w-full" variant="outline" onClick={() => setPendingVersion(version)}>
                          Ativar {name}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-strong shadow-modern">
          <CardHeader>
            <CardTitle>Precificação internacional</CardTitle>
            <CardDescription>Cotações utilizadas na precificação de transações internacionais.</CardDescription>
          </CardHeader>
          <CardContent>
            {ratesLoading ? (
              <div className="flex justify-center py-10" role="status" aria-label="Carregando cotações">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : ratesError ? (
              <div className="py-8 text-center text-sm text-destructive">
                Não foi possível carregar as cotações. Atualize a página para tentar novamente.
              </div>
            ) : exchangeRates?.length ? (
              <div className="space-y-3">
                {exchangeRates.map((rate) => (
                  <div key={rate.id} className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{CURRENCY_NAMES[rate.currency] ?? rate.code}</h3>
                        <Badge variant="outline">{rate.code}/{rate.codeIn}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{rate.name}</p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                        <span><span className="text-muted-foreground">Compra: </span><strong>{formatExchangeRate(rate.bid, rate.codeIn)}</strong></span>
                        <span><span className="text-muted-foreground">Venda: </span><strong>{formatExchangeRate(rate.ask, rate.codeIn)}</strong></span>
                        <span className={`inline-flex items-center gap-1 ${rate.pctChange >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                          {rate.pctChange >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                          {new Intl.NumberFormat("pt-BR", { signDisplay: "always", maximumFractionDigits: 3 }).format(rate.pctChange)}%
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Atualizada em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(rate.dateUpdated))}
                      </p>
                    </div>
                    <Button className="shrink-0" variant="outline" onClick={() => setPendingRate(rate)}>
                      <RefreshCw className="mr-2 h-4 w-4" />Atualizar
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">Nenhuma cotação disponível.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={pendingVersion !== null} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar alteração da IA</DialogTitle>
            <DialogDescription>
              Você está prestes a ativar a versão {pendingVersion === 1 ? "Nova" : "Legacy"}. Para continuar, digite uma frase que contenha a palavra <strong>confirm</strong>.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="Digite para confirmar"
            aria-label="Texto de confirmação"
            disabled={saving}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => closeDialog(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleChange} disabled={!canConfirm || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingRate !== null} onOpenChange={(open) => !open && !refreshing && setPendingRate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar cotação?</DialogTitle>
            <DialogDescription>
              Deseja buscar e atualizar a cotação de {pendingRate?.name ?? (pendingRate ? `${CURRENCY_NAMES[pendingRate.currency] ?? pendingRate.code}/${pendingRate.codeIn}` : "")}? O valor exibido será substituído pelos dados retornados pelo provedor.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingRate(null)} disabled={refreshing}>Cancelar</Button>
            <Button onClick={handleRefreshRate} disabled={refreshing}>
              {refreshing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar atualização
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
