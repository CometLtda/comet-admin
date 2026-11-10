import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader2, Upload, FileText, AlertTriangle, User, Eye } from "lucide-react";
import { apiService, MedItem } from "@/services/api";
import { DATE_RANGE } from "@/config/constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast";

export default function MEDs() {
  const [selectedPayer, setSelectedPayer] = useState<MedItem["payer"] | null>(null);
  const [dateRange, setDateRange] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [allMeds, setAllMeds] = useState<MedItem[]>([]);
  const navigate = useNavigate();

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['meds', dateRange, currentPage],
    queryFn: () => apiService.getMeds(dateRange, currentPage, 20),
    enabled: true,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Atualizar lista de MEDs quando novos dados chegarem
  useEffect(() => {
    if (data) {
      if (currentPage === 1) {
        setAllMeds(data);
      } else {
        setAllMeds(prev => [...prev, ...data]);
      }
    }
  }, [data, currentPage]);

  // Resetar paginação ao mudar o filtro de data
  const handleDateRangeChange = (value: string) => {
    setDateRange(parseInt(value));
    setCurrentPage(1);
    setAllMeds([]);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const hasMoreData = data && data.length === 20;

  if (error) {
    toast.error("Erro ao carregar MEDs");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">MEDs</h1>
            <p className="text-muted-foreground">Gerenciamento de Mecanismos Especiais de Devolução</p>
          </div>
          <Select value={dateRange.toString()} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DATE_RANGE).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading && currentPage === 1 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : allMeds.length > 0 ? (
          <div className="space-y-4">
            {allMeds.map((med, index) => (
              <Card key={index} className="glass-strong shadow-modern">
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
                      {med.gateway !== undefined && med.gateway !== null && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Gateway: <span className="font-medium text-foreground">{apiService.getGatewayName(med.gateway)}</span>
                        </p>
                      )}
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
                    <div className="flex items-center gap-2 flex-wrap">
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
                    {med.streamer && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Streamer</p>
                            <p className="text-sm text-muted-foreground">{med.streamer.name}</p>
                            <p className="text-xs text-muted-foreground">@{med.streamer.username}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/streamer/${med.streamer!.id}`)}
                          >
                            <User className="h-4 w-4 mr-1" />
                            Ver Perfil
                          </Button>
                        </div>
                      </div>
                    )}
                    {med.payer && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Pagador</p>
                            <p className="text-sm text-muted-foreground">{med.payer.name}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedPayer(med.payer!)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {hasMoreData && (
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  variant="outline"
                  size="lg"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    'Mostrar mais'
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<FileText className="h-8 w-8 text-muted-foreground" />}
            title="Nenhum MED encontrado"
            description="Não há registros de MEDs no momento."
            action={{
              label: "Atualizar",
              onClick: () => window.location.reload()
            }}
          />
        )}

        {/* Payer Details Modal */}
        <Dialog open={!!selectedPayer} onOpenChange={() => setSelectedPayer(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Pagador</DialogTitle>
            </DialogHeader>
            {selectedPayer && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="font-medium">{selectedPayer.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedPayer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Apelido do Doador</p>
                  <p className="font-medium">{selectedPayer.donatorNickname}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Documento</p>
                  <p className="font-medium">{selectedPayer.document}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}