import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Check,
  X,
  Trash2,
  User,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { apiService, AnticipationItem } from "@/services/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast";

const ANTICIPATION_STATUS: Record<number, string> = {
  0: "Criada",
  1: "Enviada",
  2: "Aprovada",
  3: "Recusada",
};

const statusVariant = (status: number): "default" | "secondary" | "destructive" | "outline" => {
  if (status === 2) return "default";
  if (status === 3) return "destructive";
  if (status === 1) return "secondary";
  return "outline";
};

type ActionType = "approve" | "refuse" | "remove";

const ACTION_LABELS: Record<ActionType, { title: string; description: string; confirm: string }> = {
  approve: {
    title: "Aprovar antecipação",
    description: "Tem certeza que deseja aprovar este pedido de antecipação?",
    confirm: "Aprovar",
  },
  refuse: {
    title: "Recusar antecipação",
    description: "Tem certeza que deseja recusar este pedido de antecipação?",
    confirm: "Recusar",
  },
  remove: {
    title: "Remover antecipação",
    description:
      "Esta é uma ação crítica e irreversível. Tem certeza que deseja remover este pedido de antecipação?",
    confirm: "Remover",
  },
};

const PAGE_SIZE = 25;

export default function Anticipations() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pending, setPending] = useState<{ item: AnticipationItem; action: ActionType } | null>(
    null
  );
  const [processing, setProcessing] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["anticipations", status, pageNumber],
    queryFn: () =>
      apiService.getAnticipations(
        pageNumber,
        PAGE_SIZE,
        status === "all" ? undefined : parseInt(status)
      ),
  });

  const items = data ?? [];
  const hasNextPage = items.length === PAGE_SIZE;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return "Expirado";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPageNumber(1);
  };

  const handleConfirm = async () => {
    if (!pending) return;
    setProcessing(true);
    try {
      const { item, action } = pending;
      if (action === "approve") {
        await apiService.approveAnticipation(item.publicId);
        toast.success("Antecipação aprovada com sucesso!");
      } else if (action === "refuse") {
        await apiService.refuseAnticipation(item.publicId);
        toast.success("Antecipação recusada com sucesso!");
      } else {
        await apiService.removeAnticipation(item.publicId);
        toast.success("Antecipação removida com sucesso!");
      }
      setPending(null);
      queryClient.invalidateQueries({ queryKey: ["anticipations"] });
    } catch {
      // erro já notificado pelo serviço
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Antecipações</h1>
            <p className="text-muted-foreground">Gerencie os pedidos de antecipação dos streamers</p>
          </div>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(ANTICIPATION_STATUS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length > 0 ? (
          <Card className="glass-strong shadow-modern">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Streamer</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Taxa</TableHead>
                    <TableHead className="text-right">Líquido</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.publicId}>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => navigate(`/streamer/${item.streamer.id}`)}
                          className="text-left group"
                        >
                          <span className="font-medium group-hover:text-primary transition-colors flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.streamer.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {item.streamer.email}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {item.streamer.document}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(item.dateCreated), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTimeLeft(item.secondsToAccept)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(item.status)}>
                          {ANTICIPATION_STATUS[item.status] ?? "Desconhecido"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.fullAmount)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(item.fee)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(item.resultingAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {item.status === 1 && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPending({ item, action: "approve" })}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPending({ item, action: "refuse" })}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {(item.status === 0 || item.status === 1) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setPending({ item, action: "remove" })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={<Zap className="h-8 w-8 text-muted-foreground" />}
            title="Nenhuma antecipação"
            description="Não há pedidos de antecipação para o filtro selecionado."
          />
        )}

        {(items.length > 0 || pageNumber > 1) && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={pageNumber === 1 || isFetching}
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">Página {pageNumber}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNextPage || isFetching}
              onClick={() => setPageNumber((p) => p + 1)}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending && ACTION_LABELS[pending.action].title}</AlertDialogTitle>
            <AlertDialogDescription>
              {pending && ACTION_LABELS[pending.action].description}
              {pending && (
                <span className="block mt-2 text-foreground">
                  {pending.item.streamer.name} — {formatCurrency(pending.item.fullAmount)}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={processing}
            >
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {pending && ACTION_LABELS[pending.action].confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
