import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader2, User, MessageSquare, DollarSign, Settings, Shield, AlertTriangle, Lock, Unlock, CreditCard, ExternalLink, ScrollText, ChevronLeft, ChevronRight } from "lucide-react";
import { apiService, StreamerTransactionsResponse, StreamerFees, UpdateFeesRequest, MedItem } from "@/services/api";
import { FEE_DURATION, TRANSACTION_STATUS, FEE_DURATION_LABELS, WITHDRAW_STATUS } from "@/config/constants";
import { format, parseISO, subHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast";

export default function StreamerDetail() {
  const { streamerId } = useParams<{ streamerId: string }>();
  const [newDocument, setNewDocument] = useState("");
  const [anticipationDays, setAnticipationDays] = useState(30);
  const [newFees, setNewFees] = useState<UpdateFeesRequest>({ percentageFee: 0, duration: 0 });
  const [isUpdatingDocument, setIsUpdatingDocument] = useState(false);
  const [isUpdatingAnticipation, setIsUpdatingAnticipation] = useState(false);
  const [isUpdatingFees, setIsUpdatingFees] = useState(false);
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [currentMedsPage, setCurrentMedsPage] = useState(1);
  const [currentLogsPage, setCurrentLogsPage] = useState(1);
  const [currentReceiptsPage, setCurrentReceiptsPage] = useState(1);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [isBlockingStreamer, setIsBlockingStreamer] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [isTogglingCard, setIsTogglingCard] = useState(false);
  const [isLoggingAsStreamer, setIsLoggingAsStreamer] = useState(false);

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['streamer-transactions', streamerId, currentPage],
    queryFn: async () => {
      const data = await apiService.getStreamerTransactions(Number(streamerId), currentPage, 10);
      if (currentPage === 1) {
        setAllTransactions(data.transactions);
      } else {
        setAllTransactions(prev => [...prev, ...data.transactions]);
      }
      return data;
    },
    enabled: !!streamerId,
  });

  const { data: feesData } = useQuery({
    queryKey: ['streamer-fees', streamerId],
    queryFn: () => apiService.getStreamerFees(Number(streamerId)),
    enabled: !!streamerId,
  });

  const { data: medsData, isLoading: medsLoading } = useQuery({
    queryKey: ['streamer-meds', streamerId, currentMedsPage],
    queryFn: () => apiService.getStreamerMeds(Number(streamerId), currentMedsPage, 20),
    enabled: !!streamerId,
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['streamer-activity-logs', streamerId, currentLogsPage],
    queryFn: () => apiService.getStreamerActivityLogs(Number(streamerId), currentLogsPage, 25),
    enabled: !!streamerId,
  });

  const { data: receiptsData, isLoading: receiptsLoading } = useQuery({
    queryKey: ['streamer-receipts', streamerId, currentReceiptsPage],
    queryFn: () => apiService.getStreamerReceipts(Number(streamerId), currentReceiptsPage, 25),
    enabled: !!streamerId,
  });



  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatLogDate = (date: string) => {
    return format(subHours(parseISO(date), 3), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const formatDocument = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 11) {
      // CPF mask: XXX.XXX.XXX-XX
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ mask: XX.XXX.XXX/XXXX-XX
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const handleDocumentChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      const formatted = formatDocument(numbers);
      setNewDocument(formatted);
    }
  };

  const getTransactionStatus = (status: number) => {
    return TRANSACTION_STATUS[status] || 'Desconhecido';
  };

  const getWithdrawStatusVariant = (status: number): "success" | "warning" | "destructive" | "info" | "secondary" => {
    const map: Record<number, "success" | "warning" | "destructive" | "info" | "secondary"> = {
      0: "warning",
      1: "success",
      2: "destructive",
      3: "info",
      4: "destructive",
      5: "warning",
      6: "warning",
    };
    return map[status] || "secondary";
  };

  const getTransactionStatusBadge = (status: number) => {
    const statusMap: Record<number, { variant: "success" | "warning" | "destructive" | "info" | "secondary", label: string }> = {
      0: { variant: "secondary", label: "Criada" },
      1: { variant: "info", label: "Processando" },
      2: { variant: "info", label: "Autorizada" },
      3: { variant: "success", label: "Aprovada" },
      4: { variant: "destructive", label: "Reembolsada" },
      5: { variant: "warning", label: "Aguardando pagamento" },
      6: { variant: "warning", label: "Aguardando estorno" },
      7: { variant: "destructive", label: "Cancelada" },
      8: { variant: "destructive", label: "Chargeback" },
      9: { variant: "info", label: "Analisando" },
      10: { variant: "warning", label: "Pendente de Revisão" },
    };
    
    return statusMap[status] || { variant: "secondary", label: "Desconhecido" };
  };

  const loadMoreTransactions = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleUpdateDocument = async () => {
    if (!streamerId || !newDocument) return;
    
    setIsUpdatingDocument(true);
    try {
      await apiService.updateStreamerDocument(Number(streamerId), newDocument);
      toast.success("Documento atualizado com sucesso!");
      setNewDocument("");
    } catch (error) {
      toast.error("Erro ao atualizar documento");
    } finally {
      setIsUpdatingDocument(false);
    }
  };

  const handleUpdateAnticipation = async () => {
    if (!streamerId) return;
    
    setIsUpdatingAnticipation(true);
    try {
      await apiService.updateStreamerAnticipation(Number(streamerId), anticipationDays);
      toast.success("Antecipação atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar antecipação");
    } finally {
      setIsUpdatingAnticipation(false);
    }
  };

  const handleUpdateFees = async () => {
    if (!streamerId) return;
    
    setIsUpdatingFees(true);
    try {
      await apiService.updateStreamerFees(Number(streamerId), newFees);
      toast.success("Taxas atualizadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar taxas");
    } finally {
      setIsUpdatingFees(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!streamerId) return;
    
    setIsDisabling2FA(true);
    try {
      await apiService.disableStreamer2FA(Number(streamerId));
      toast.success("2FA desabilitado com sucesso!");
      setIs2FADialogOpen(false);
    } catch (error) {
      toast.error("Erro ao desabilitar 2FA");
    } finally {
      setIsDisabling2FA(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!streamerId || !newUsername) return;
    
    setIsUpdatingUsername(true);
    try {
      await apiService.updateStreamerUsername(Number(streamerId), newUsername);
      toast.success("Nome de usuário atualizado com sucesso!");
      setNewUsername("");
    } catch (error) {
      toast.error("Erro ao atualizar nome de usuário");
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!streamerId || !newEmail) return;
    
    setIsUpdatingEmail(true);
    try {
      await apiService.updateStreamerEmail(Number(streamerId), newEmail);
      toast.success("E-mail atualizado com sucesso!");
      setNewEmail("");
    } catch (error) {
      toast.error("Erro ao atualizar e-mail");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleBlockUnblock = async () => {
    if (!streamerId || !transactionsData) return;
    
    setIsBlockingStreamer(true);
    try {
      if (transactionsData.streamer.isActive) {
        await apiService.blockStreamer(Number(streamerId));
        toast.success("Streamer bloqueado com sucesso!");
      } else {
        await apiService.unblockStreamer(Number(streamerId));
        toast.success("Streamer desbloqueado com sucesso!");
      }
      setBlockDialogOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error("Erro ao executar ação");
    } finally {
      setIsBlockingStreamer(false);
    }
  };

  const handleToggleCard = async () => {
    if (!streamerId || !transactionsData) return;
    
    setIsTogglingCard(true);
    try {
      const newState = !transactionsData.streamer.isCardEnabled;
      await apiService.toggleStreamerCard(Number(streamerId), newState);
      toast.success(newState ? "Cartão habilitado com sucesso!" : "Cartão desabilitado com sucesso!");
      setCardDialogOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error("Erro ao alterar status do cartão");
    } finally {
      setIsTogglingCard(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!transactionsData) {
    return (
      <DashboardLayout>
        <EmptyState
          icon={<User className="h-8 w-8 text-muted-foreground" />}
          title="Streamer não encontrado"
          description="Não foi possível encontrar os dados do streamer."
        />
      </DashboardLayout>
    );
  }

  const { streamer, transactions, transactionsAmount, transactionsCount } = transactionsData;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {streamer.profileImage ? (
              <img 
                src={streamer.profileImage} 
                alt={streamer.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold gradient-text">{streamer.name}</h1>
              <p className="text-muted-foreground">{streamer.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">CPF: {streamer.document}</span>
                {streamer.isVerified && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verificado
                  </span>
                )}
                {streamer.isActive ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Ativo
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inativo
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={async () => {
              setIsLoggingAsStreamer(true);
              try {
                const res = await apiService.loginAsStreamer(Number(streamerId));
                const url = `https://infra.comet.com.br/admin-login?token=${res.authToken}&ntsu=${res.needsToSetUsername}&nai=${res.needsAdditionalInfo}&username=${res.username}`;
                window.open(url, '_blank');
              } catch (error) {
                toast.error("Erro ao acessar conta do streamer");
              } finally {
                setIsLoggingAsStreamer(false);
              }
            }}
            disabled={isLoggingAsStreamer}
          >
            {isLoggingAsStreamer ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-2" />
            )}
            Acessar conta
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="glass-strong">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Arrecadado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(transactionsAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {transactionsCount} transações
              </p>
            </CardContent>
          </Card>

          <Card className="glass-strong">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Antecipação Disponível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {streamer.customAvailableFrom} dias
              </div>
            </CardContent>
          </Card>

          <Card className="glass-strong">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {feesData?.percentageFee.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Taxa de serviço
              </p>
            </CardContent>
          </Card>

          <Card className="glass-strong">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                streamer.feedbackAlertRate === undefined || streamer.feedbackAlertRate === null
                  ? ''
                  : streamer.feedbackAlertRate <= 50
                    ? 'text-red-600'
                    : 'text-green-600'
              }`}>
                {streamer.feedbackAlertRate !== undefined && streamer.feedbackAlertRate !== null
                  ? `${streamer.feedbackAlertRate.toFixed(1)}%`
                  : '—'}
              </div>
              <p className="text-xs text-muted-foreground">
                Índice de alertas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="fees">Taxas</TabsTrigger>
            <TabsTrigger value="meds">MEDs</TabsTrigger>
            <TabsTrigger value="receipts">Saques</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            {allTransactions.length > 0 ? (
              <div className="space-y-4">
                {allTransactions.map((transaction, index) => (
                  <Card key={index} className="glass-strong">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{transaction.donatorNickname}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.donatorMessage}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(transaction.dateCreated), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-primary">
                            {formatCurrency(transaction.streamerAmount)}
                          </p>
                          <Badge variant={getTransactionStatusBadge(transaction.status).variant}>
                            {getTransactionStatusBadge(transaction.status).label}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {transactionsData && allTransactions.length < transactionsData.transactionsCount && (
                  <div className="flex justify-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={loadMoreTransactions}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        "Ver mais transações"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<DollarSign className="h-8 w-8 text-muted-foreground" />}
                title="Nenhuma transação encontrada"
                description="Este streamer ainda não possui transações."
              />
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="glass-strong mb-6">
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Gerenciar configurações de segurança</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Dialog open={is2FADialogOpen} onOpenChange={setIs2FADialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Shield className="mr-2 h-4 w-4" />
                      Desabilitar 2FA
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar Desabilitação do 2FA</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-orange-900 dark:text-orange-200">Aviso de Segurança</p>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Desabilitar a autenticação de dois fatores tornará a conta menos segura. Tem certeza que deseja continuar?
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setIs2FADialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={handleDisable2FA}
                          disabled={isDisabling2FA}
                        >
                          {isDisabling2FA ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Desabilitando...
                            </>
                          ) : (
                            "Confirmar Desabilitação"
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant={transactionsData?.streamer.isActive ? "destructive" : "default"}>
                      {transactionsData?.streamer.isActive ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Bloquear Streamer
                        </>
                      ) : (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          Desbloquear Streamer
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {transactionsData?.streamer.isActive ? "Bloquear Streamer" : "Desbloquear Streamer"}
                      </DialogTitle>
                      <DialogDescription>
                        {transactionsData?.streamer.isActive 
                          ? "Tem certeza que deseja bloquear este streamer? Esta é uma ação sensível e impedirá o acesso do usuário."
                          : "Tem certeza que deseja desbloquear este streamer? O usuário terá acesso restaurado."}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        variant={transactionsData?.streamer.isActive ? "destructive" : "default"}
                        onClick={handleBlockUnblock}
                        disabled={isBlockingStreamer}
                      >
                        {isBlockingStreamer ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          "Confirmar"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="glass-strong mb-6">
              <CardHeader>
                <CardTitle>Cartão</CardTitle>
                <CardDescription>Gerenciar pagamentos por cartão</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Pagamentos por Cartão</p>
                      <p className="text-sm text-muted-foreground">
                        {transactionsData?.streamer.isCardEnabled 
                          ? "Cartão habilitado para este streamer" 
                          : "Cartão desabilitado para este streamer"}
                      </p>
                    </div>
                  </div>
                  <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant={transactionsData?.streamer.isCardEnabled ? "destructive" : "default"}>
                        {transactionsData?.streamer.isCardEnabled ? "Desabilitar" : "Habilitar"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {transactionsData?.streamer.isCardEnabled ? "Desabilitar Cartão" : "Habilitar Cartão"}
                        </DialogTitle>
                        <DialogDescription>
                          {transactionsData?.streamer.isCardEnabled 
                            ? "Esta ação terá efeito imediato. O streamer não poderá mais receber pagamentos por cartão."
                            : "Esta ação terá efeito imediato. O streamer poderá receber pagamentos por cartão."}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCardDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button
                          variant={transactionsData?.streamer.isCardEnabled ? "destructive" : "default"}
                          onClick={handleToggleCard}
                          disabled={isTogglingCard}
                        >
                          {isTogglingCard ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processando...
                            </>
                          ) : (
                            "Confirmar"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-strong">
                <CardHeader>
                  <CardTitle>Atualizar Documento</CardTitle>
                  <CardDescription>Alterar CPF/CNPJ do streamer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="document">Novo Documento</Label>
                    <Input
                      id="document"
                      value={newDocument}
                      onChange={(e) => handleDocumentChange(e.target.value)}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    />
                  </div>
                  <Button 
                    onClick={handleUpdateDocument}
                    disabled={!newDocument || isUpdatingDocument}
                  >
                    {isUpdatingDocument ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      "Atualizar Documento"
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-strong">
                <CardHeader>
                  <CardTitle>Antecipação</CardTitle>
                  <CardDescription>Configurar prazo de antecipação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="anticipation">Dias para Antecipação</Label>
                    <Input
                      id="anticipation"
                      type="number"
                      value={anticipationDays}
                      onChange={(e) => setAnticipationDays(Number(e.target.value))}
                      min="1"
                      max="90"
                    />
                  </div>
                  <Button 
                    onClick={handleUpdateAnticipation}
                    disabled={isUpdatingAnticipation}
                  >
                    {isUpdatingAnticipation ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      "Atualizar Antecipação"
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-strong">
                <CardHeader>
                  <CardTitle>Atualizar Nome de Usuário</CardTitle>
                  <CardDescription>Alterar nome de usuário do streamer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="username">Novo Nome de Usuário</Label>
                    <Input
                      id="username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Digite o novo nome de usuário"
                    />
                  </div>
                  <Button 
                    onClick={handleUpdateUsername}
                    disabled={!newUsername || isUpdatingUsername}
                  >
                    {isUpdatingUsername ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      "Atualizar Nome de Usuário"
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-strong">
                <CardHeader>
                  <CardTitle>Atualizar E-mail</CardTitle>
                  <CardDescription>Alterar e-mail do streamer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Novo E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Digite o novo e-mail"
                    />
                  </div>
                  <Button 
                    onClick={handleUpdateEmail}
                    disabled={!newEmail || isUpdatingEmail}
                  >
                    {isUpdatingEmail ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      "Atualizar E-mail"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fees" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-strong">
                <CardHeader>
                  <CardTitle>Taxas Atuais</CardTitle>
                  <CardDescription>Configuração de taxas do streamer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {feesData && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Taxa Percentual:</span>
                        <span className="font-medium">{feesData.percentageFee.toFixed(2)}%</span>
                      </div>
                      {/* <div className="flex justify-between">
                        <span>Taxa Fixa:</span>
                        <span className="font-medium">{formatCurrency(feesData.fixedFee)}</span>
                      </div> */}
                      <div className="flex justify-between">
                        <span>Taxa de Saída:</span>
                        <span className="font-medium">{formatCurrency(feesData.fixedOutFee)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-strong">
                <CardHeader>
                  <CardTitle>Nova Taxa</CardTitle>
                  <CardDescription>Criar nova configuração de taxa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="percentage">Taxa Percentual (%)</Label>
                    <Input
                      id="percentage"
                      type="number"
                      step="0.01"
                      value={newFees.percentageFee}
                      onChange={(e) => setNewFees(prev => ({ ...prev, percentageFee: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duração</Label>
                    <select 
                      id="duration"
                      className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                      value={newFees.duration}
                      onChange={(e) => setNewFees(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    >
                      {FEE_DURATION.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button 
                    onClick={handleUpdateFees}
                    disabled={isUpdatingFees}
                  >
                    {isUpdatingFees ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Nova Taxa"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="meds" className="space-y-4">
            {medsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : medsData && medsData.length > 0 ? (
              <div className="space-y-4">
                {medsData.map((med, index) => (
                  <Card key={index} className="glass-strong">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          <div>
                            <CardTitle className="text-lg">{med.payerName}</CardTitle>
                            <p className="text-sm text-muted-foreground">Conta: {med.account}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-primary">
                            {formatCurrency(med.amount)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {med.generated}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">End to End ID</p>
                          <p className="font-mono text-sm">{med.endToEndId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Documento</p>
                          <p className="font-medium">{med.document}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Detalhes</p>
                          <p className="text-sm">{med.details}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            med.hasTransactionAssociated 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {med.hasTransactionAssociated ? 'Transação Associada' : 'Sem Transação'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            med.wasAnswered 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {med.wasAnswered ? 'Respondido' : 'Não Respondido'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<AlertTriangle className="h-8 w-8 text-muted-foreground" />}
                title="Nenhum MED encontrado"
                description="Este streamer não possui MEDs."
              />
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            {logsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : logsData && logsData.items.length > 0 ? (
              <div className="space-y-4">
                {logsData.items.map((log) => (
                  <Card key={log.id} className="glass-strong">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{log.method}</Badge>
                            <p className="font-medium">{log.action}</p>
                          </div>
                          <p className="font-mono text-sm text-muted-foreground break-all">{log.route}</p>
                          <p className="text-xs text-muted-foreground break-all">
                            IP: {log.ipAddress}
                          </p>
                          <p className="text-xs text-muted-foreground break-all">
                            {log.userAgent}
                          </p>
                          {log.additionalInfo && (
                            <p className="text-xs text-muted-foreground break-all">
                              {log.additionalInfo}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatLogDate(log.dateCreated)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground">
                    Página {logsData.page} de {logsData.totalPages} · {logsData.total} registros
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentLogsPage((p) => Math.max(1, p - 1))}
                      disabled={currentLogsPage <= 1 || logsLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentLogsPage((p) => p + 1)}
                      disabled={currentLogsPage >= logsData.totalPages || logsLoading}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<ScrollText className="h-8 w-8 text-muted-foreground" />}
                title="Nenhum log encontrado"
                description="Este streamer ainda não possui logs de atividade."
              />
            )}
          </TabsContent>

          <TabsContent value="receipts" className="space-y-4">
            {receiptsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : receiptsData && receiptsData.length > 0 ? (
              <div className="space-y-4">
                {receiptsData.map((receipt, index) => (
                  <Card key={index} className="glass-strong">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant={getWithdrawStatusVariant(receipt.status)}>
                              {WITHDRAW_STATUS[receipt.status] || "Desconhecido"}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(receipt.dateCreated), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                          <p className="font-medium">{receipt.bankName}</p>
                          <p className="text-sm text-muted-foreground">
                            Banco {receipt.bankCode} · Conta {receipt.bankAccount}-{receipt.bankAccountCheckDigit}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-primary">
                            {formatCurrency(receipt.amount)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Taxa: {formatCurrency(receipt.fee)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground">Página {currentReceiptsPage}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentReceiptsPage((p) => Math.max(1, p - 1))}
                      disabled={currentReceiptsPage <= 1 || receiptsLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentReceiptsPage((p) => p + 1)}
                      disabled={receiptsData.length < 25 || receiptsLoading}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<DollarSign className="h-8 w-8 text-muted-foreground" />}
                title="Nenhum saque encontrado"
                description="Este streamer ainda não possui saques."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
