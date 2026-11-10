import { ReactNode, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MessageCircle, Percent, User, Wallet } from "lucide-react";
import { apiService } from "@/services/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import toast from "react-hot-toast";

const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const formatDateTime = (value: string | null) =>
  value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "—";

const onlyDigits = (value: string | null | undefined) => (value ?? "").replace(/\D/g, "");

const buildWhatsAppUrl = (phone: string | null, name: string) => {
  let digits = onlyDigits(phone);
  if (!digits) return null;
  // Stored phones are local (DDD + number); only prefix the country code when it isn't there already.
  if (!(digits.length >= 12 && digits.startsWith("55"))) digits = `55${digits}`;
  const firstName = name.trim().split(/\s+/)[0] ?? "";
  const text = encodeURIComponent(`Olá ${firstName}, tudo bem?`);
  return `https://api.whatsapp.com/send?phone=${digits}&text=${text}`;
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="space-y-1">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <div className="text-sm font-medium break-words">{children || "—"}</div>
  </div>
);

const UserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [markupOpen, setMarkupOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [markup, setMarkup] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => apiService.getUser(userId!),
    enabled: !!userId,
  });

  const submitBalance = async () => {
    if (!user || Number(amount) <= 0 || !description.trim()) return;
    setSaving(true);
    try {
      const result = await apiService.injectBalance(user.publicId, Number(amount), description.trim());
      toast.success(`Saldo injetado: ${formatCurrency(result.amount)}`);
      setBalanceOpen(false); setAmount(""); setDescription("");
      await refetch();
    } catch { toast.error("Erro ao injetar saldo"); } finally { setSaving(false); }
  };

  const submitMarkup = async () => {
    if (!user || markup === "" || Number(markup) < 0) return;
    setSaving(true);
    try {
      const result = await apiService.updateMarkup(user.publicId, Number(markup));
      toast.success(`Taxa atualizada para ${result.customQuoteMarkupPercentage}%`);
      setMarkupOpen(false); setMarkup("");
      await refetch();
    } catch { toast.error("Erro ao atualizar taxa"); } finally { setSaving(false); }
  };

  const openMarkup = () => {
    setMarkup(user?.customQuoteMarkupPercentage != null ? String(user.customQuoteMarkupPercentage) : "");
    setMarkupOpen(true);
  };

  const whatsAppUrl = user ? buildWhatsAppUrl(user.phone, user.name) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/cadastros"><ArrowLeft className="mr-1 h-4 w-4" />Voltar</Link>
        </Button>

        {error ? (
          <EmptyState icon={<User className="h-8 w-8 text-muted-foreground" />} title="Usuário não encontrado" description="Não foi possível carregar os dados deste usuário." />
        ) : isLoading || !user ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  {user.isBlocked && <Badge variant="destructive">Bloqueado</Badge>}
                </div>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {whatsAppUrl ? (
                  <Button asChild variant="outline">
                    <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-4 w-4" />WhatsApp</a>
                  </Button>
                ) : (
                  <Button variant="outline" disabled><MessageCircle className="mr-2 h-4 w-4" />WhatsApp</Button>
                )}
                <Button variant="outline" onClick={() => setBalanceOpen(true)}><Wallet className="mr-2 h-4 w-4" />Saldo</Button>
                <Button variant="outline" onClick={openMarkup}><Percent className="mr-2 h-4 w-4" />Taxa</Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground font-medium">Saldo atual</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatCurrency(user.balance)}</CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground font-medium">Total recarregado</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatCurrency(user.totalToppedUp)}</CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground font-medium">Etiquetas geradas</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{user.labelsCount}</div><p className="text-xs text-muted-foreground">{formatCurrency(user.totalLabelsPrice)} em etiquetas · {user.shipmentsCount} envios</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground font-medium">Taxa aplicada</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{user.effectiveQuoteMarkupPercentage}%</div><p className="text-xs text-muted-foreground">{user.customQuoteMarkupPercentage != null ? "Taxa personalizada" : "Taxa padrão"}</p></CardContent></Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Dados do usuário</CardTitle></CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email">{user.email}</Field>
                  <Field label="Telefone">{user.phone}</Field>
                  <Field label="Documento">{user.document}</Field>
                  <Field label="Código de indicação">{user.referralCode}</Field>
                  <Field label="Cadastrado em">{formatDateTime(user.createdAt)}</Field>
                  <Field label="Atualizado em">{formatDateTime(user.updatedAt)}</Field>
                  <Field label="Indicado por">{user.referredByName ? `${user.referredByName} (${user.referredByEmail})` : null}</Field>
                  <Field label="Indicações feitas">{String(user.referralsMadeCount)}</Field>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Origem do cadastro (UTM)</CardTitle></CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <Field label="utm_source">{user.utmSource}</Field>
                  <Field label="utm_medium">{user.utmMedium}</Field>
                  <Field label="utm_campaign">{user.utmCampaign}</Field>
                  <Field label="utm_term">{user.utmTerm}</Field>
                  <Field label="utm_content">{user.utmContent}</Field>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <Dialog open={balanceOpen} onOpenChange={setBalanceOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Injetar saldo</DialogTitle><DialogDescription>Adicionar saldo para {user?.name}.</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="balance-amount">Valor (R$)</Label><Input id="balance-amount" type="number" min="0.01" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="balance-description">Descrição</Label><Textarea id="balance-description" value={description} onChange={event => setDescription(event.target.value)} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBalanceOpen(false)}>Cancelar</Button>
              <Button disabled={saving || Number(amount) <= 0 || !description.trim()} onClick={submitBalance}>{saving ? "Salvando..." : "Confirmar saldo"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={markupOpen} onOpenChange={setMarkupOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Alterar taxa</DialogTitle><DialogDescription>Definir a taxa personalizada de {user?.name}.</DialogDescription></DialogHeader>
            <div className="space-y-2"><Label htmlFor="markup-percentage">Markup (%)</Label><Input id="markup-percentage" type="number" min="0" step="0.01" value={markup} onChange={event => setMarkup(event.target.value)} /></div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMarkupOpen(false)}>Cancelar</Button>
              <Button disabled={saving || markup === "" || Number(markup) < 0} onClick={submitMarkup}>{saving ? "Salvando..." : "Salvar taxa"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default UserDetail;
