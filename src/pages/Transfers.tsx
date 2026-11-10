import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader2, DollarSign, User, Check, X, Shield, UserCheck, CheckCircle, XCircle, Pause } from "lucide-react";
import { apiService, TransferRequest } from "@/services/api";
import { WITHDRAW_STATUS, ANALYSIS_RESULT, ANALYSIS_RESULT_OPTIONS } from "@/config/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast";

export default function Transfers() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [allData, setAllData] = useState<TransferRequest[]>([]);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingActions, setLoadingActions] = useState<Record<number, string>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'verify' | 'block' | 'standby' | null;
    transferRequestId: number | null;
    streamerId: number | null;
  }>({
    open: false,
    action: null,
    transferRequestId: null,
    streamerId: null,
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['transfers', page, statusFilter],
    queryFn: () => apiService.getTransferRequests(page, 25, statusFilter === "all" ? undefined : Number(statusFilter)),
    enabled: true,
  });

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllData(data);
      } else {
        setAllData(prev => [...prev, ...data]);
      }
      setHasMoreData(data.length === 25);
    }
  }, [data, page]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusLabel = (status: number) => {
    return WITHDRAW_STATUS[status] || "Desconhecido";
  };

  const getStatusColor = (status: number) => {
    const colorMap: Record<number, string> = {
      0: "bg-yellow-100 text-yellow-800", // Pendente
      1: "bg-green-100 text-green-800", // Transferido
      2: "bg-red-100 text-red-800", // Falhou
      3: "bg-blue-100 text-blue-800", // Processando
      4: "bg-red-100 text-red-800", // Cancelado
      5: "bg-orange-100 text-orange-800" // Parcialmente Transferido
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const openConfirmDialog = (action: 'verify' | 'block' | 'standby', transferRequestId: number, streamerId?: number) => {
    setConfirmDialog({
      open: true,
      action,
      transferRequestId,
      streamerId: streamerId ?? null,
    });
  };

  const handleAction = async (actionType: string, transferRequestId: number, streamerId?: number) => {
    setLoadingActions(prev => ({ ...prev, [transferRequestId]: actionType }));

    try {
      switch (actionType) {
        case 'approve':
          await apiService.approveTransferRequest(transferRequestId);
          toast.success("Transferência aprovada com sucesso!");
          break;
        case 'refuse':
          await apiService.refuseTransferRequest(transferRequestId);
          toast.success("Transferência recusada com sucesso!");
          break;
        case 'standby':
          await apiService.standbyTransferRequest(transferRequestId);
          toast.success("Transferência colocada em espera com sucesso!");
          break;
        case 'verify':
          if (streamerId) {
            await apiService.verifyStreamerWithdraw(streamerId);
            toast.success("Streamer verificado com sucesso!");
          }
          break;
        case 'block':
          if (streamerId) {
            await apiService.blockStreamer(streamerId);
            toast.success("Streamer bloqueado com sucesso!");
          }
          break;
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      setPage(1);
      setConfirmDialog({ open: false, action: null, transferRequestId: null, streamerId: null });
    } catch (error) {
      toast.error("Erro ao executar ação");
    } finally {
      setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[transferRequestId];
        return newState;
      });
    }
  };

  if (error) {
    toast.error("Erro ao carregar solicitações de transferência");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Solicitações de Transferência</h1>
            <p className="text-muted-foreground">Gerencie as solicitações de saque dos streamers</p>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Pendente de Análise</SelectItem>
              {ANALYSIS_RESULT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading && page === 1 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {allData.map((transfer) => (
              <Card key={transfer.request.id} className="glass-strong shadow-modern hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {transfer.streamerProfileImage ? (
                        <img
                          src={transfer.streamerProfileImage}
                          alt={transfer.streamerName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <CardTitle
                          className="text-lg cursor-pointer hover:text-primary transition-colors"
                          onClick={() => navigate(`/streamer/${transfer.streamerId}`)}
                        >
                          {transfer.streamerName}
                        </CardTitle>
                        <CardDescription>{transfer.streamerEmail}</CardDescription>
                        <CardDescription className="text-xs">
                          Conta criada em {format(parseISO(transfer.streamerDateCreated), "dd/MM/yyyy", { locale: ptBR })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(transfer.request.withdrawAmount)}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transfer.withdrawStatus)}`}>
                        {getStatusLabel(transfer.withdrawStatus)}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Data da Solicitação</p>
                      <p className="font-medium">
                        {format(parseISO(transfer.request.dateCreated), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ticket Médio</p>
                      <p className="font-medium">{formatCurrency(transfer.request.averageTicket)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                      <p className="font-medium">{(transfer.request.conversionRate * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Saques</p>
                      <p className="font-medium">{formatCurrency(transfer.request.withdrawalsAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quantidade de Saques</p>
                      <p className="font-medium">{transfer.request.withdrawalsCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reembolsos</p>
                      <p className="font-medium">{transfer.request.refundsCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">MEDs</p>
                      <p className="font-medium">{transfer.request.medsCount} ({formatCurrency(transfer.request.medsAmount)})</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Feedback</p>
                      <p className={`font-medium ${transfer.request.feedbackAlertRate <= 50 ? 'text-red-600' : 'text-green-600'}`}>
                        {(transfer.request.feedbackAlertRate).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status da Análise</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transfer.request.analysisResult === 1 ? 'bg-green-100 text-green-800' :
                          transfer.request.analysisResult === 2 || transfer.request.analysisResult === 3 ? 'bg-red-100 text-red-800' :
                            transfer.request.analysisResult === 4 ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                        }`}>
                        {ANALYSIS_RESULT[transfer.request.analysisResult] || "Desconhecido"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Integrações</p>
                      <div className="flex gap-1 flex-wrap">
                        {transfer.request.hasStreamElementsIntegration && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            StreamElements
                          </span>
                        )}
                        {transfer.request.hasStreamLabsIntegration && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            StreamLabs
                          </span>
                        )}
                        {transfer.request.hasTwitchIntegration && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                            Twitch
                          </span>
                        )}
                        {!transfer.request.hasStreamElementsIntegration &&
                          !transfer.request.hasStreamLabsIntegration &&
                          !transfer.request.hasTwitchIntegration && (
                            <span className="text-xs text-muted-foreground">Nenhuma</span>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAction('approve', transfer.request.id)}
                      disabled={!!loadingActions[transfer.request.id]}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loadingActions[transfer.request.id] === 'approve' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Aprovar
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction('refuse', transfer.request.id)}
                      disabled={!!loadingActions[transfer.request.id]}
                    >
                      {loadingActions[transfer.request.id] === 'refuse' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Recusar
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConfirmDialog('standby', transfer.request.id)}
                      disabled={!!loadingActions[transfer.request.id]}
                      className="border-amber-200 text-amber-600 hover:bg-amber-50"
                    >
                      {loadingActions[transfer.request.id] === 'standby' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Colocar em espera
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConfirmDialog('verify', transfer.request.id, transfer.streamerId)}
                      disabled={!!loadingActions[transfer.request.id]}
                    >
                      {loadingActions[transfer.request.id] === 'verify' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Verificar Streamer
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConfirmDialog('block', transfer.request.id, transfer.streamerId)}
                      disabled={!!loadingActions[transfer.request.id]}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      {loadingActions[transfer.request.id] === 'block' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-1" />
                          Bloquear Streamer
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {hasMoreData && (
              <div className="flex justify-center pt-6">
                <Button
                  onClick={loadMore}
                  disabled={isLoading}
                  variant="outline"
                  className="px-8"
                >
                  {isLoading && page > 1 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    "Carregar mais"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {!isLoading && allData.length === 0 && (
          <EmptyState
            icon={<DollarSign className="h-8 w-8 text-muted-foreground" />}
            title="Nenhuma solicitação encontrada"
            description="Não há solicitações de transferência no momento."
            action={{
              label: "Atualizar",
              onClick: () => window.location.reload()
            }}
          />
        )}

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmDialog.action === 'verify'
                  ? 'Verificar Streamer'
                  : confirmDialog.action === 'standby'
                    ? 'Colocar em espera'
                    : 'Bloquear Streamer'}
              </DialogTitle>
              <DialogDescription>
                {confirmDialog.action === 'verify'
                  ? 'Tem certeza que deseja verificar este streamer? Esta ação permitirá que ele realize saques.'
                  : confirmDialog.action === 'standby'
                    ? 'Tem certeza que deseja colocar esta solicitação de transferência em espera?'
                    : 'Tem certeza que deseja bloquear este streamer? Esta é uma ação sensível e impedirá o acesso do usuário.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ open: false, action: null, transferRequestId: null, streamerId: null })}
              >
                Cancelar
              </Button>
              <Button
                variant={confirmDialog.action === 'verify' ? 'default' : confirmDialog.action === 'standby' ? 'outline' : 'destructive'}
                onClick={() => {
                  if (confirmDialog.action && confirmDialog.transferRequestId) {
                    handleAction(confirmDialog.action, confirmDialog.transferRequestId, confirmDialog.streamerId ?? undefined);
                  }
                }}
                className={confirmDialog.action === 'standby' ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : ''}
              >
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}