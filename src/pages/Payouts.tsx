import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader2, DollarSign, Calendar, Wallet } from "lucide-react";
import { apiService, PayoutItem } from "@/services/api";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface GroupedPayouts {
  [date: string]: PayoutItem[];
}

export default function Payouts() {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<PayoutItem[]>([]);
  const [hasMoreData, setHasMoreData] = useState(true);

  const { data, isLoading, error } = useQuery({
    queryKey: ['payouts', page],
    queryFn: () => apiService.getPayouts(page, 10),
    enabled: true,
  });

  const { data: availableAmountData } = useQuery({
    queryKey: ['available-amount'],
    queryFn: () => apiService.getAvailableAmount(),
    enabled: true,
  });

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllData(data);
      } else {
        setAllData(prev => [...prev, ...data]);
      }
      setHasMoreData(data.length === 10);
    }
  }, [data, page]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateKey = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "Hoje";
    if (isYesterday(date)) return "Ontem";
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  const groupPayoutsByDate = (payouts: PayoutItem[]): GroupedPayouts => {
    return payouts.reduce((groups, payout) => {
      const dateKey = format(parseISO(payout.dateRead), "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(payout);
      return groups;
    }, {} as GroupedPayouts);
  };

  const calculateDayTotal = (payouts: PayoutItem[]) => {
    return payouts.reduce((sum, payout) => sum + payout.amount, 0);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (error) {
    toast.error("Erro ao carregar dados de repasses");
  }

  const groupedPayouts = groupPayoutsByDate(allData);
  const sortedDates = Object.keys(groupedPayouts).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Repasses</h1>
            <p className="text-muted-foreground">Histórico de repasses diários</p>
          </div>
        </div>

        {/* Available Amount Cards */}
        {availableAmountData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableAmountData.availableAmount.map((item) => (
              <Card key={item.gateway} className="glass-strong">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {apiService.getGatewayName(item.gateway)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(item.amount)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Saldo disponível
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isLoading && page === 1 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <Accordion type="multiple" className="space-y-4">
              {sortedDates.map((dateKey) => {
                const dayPayouts = groupedPayouts[dateKey];
                const dayTotal = calculateDayTotal(dayPayouts);
                const displayDate = formatDateKey(dayPayouts[0].dateRead);
                
                return (
                  <AccordionItem 
                    key={dateKey} 
                    value={dateKey}
                    className="border-none"
                  >
                    <Card className="glass-strong shadow-modern hover:shadow-glow transition-all duration-300">
                      <AccordionTrigger className="hover:no-underline px-6 py-4">
                        <div className="flex items-center justify-between w-full mr-4">
                          <div className="flex items-center gap-4">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div className="text-left">
                              <h3 className="font-semibold text-lg">{displayDate}</h3>
                              <p className="text-sm text-muted-foreground">
                                {dayPayouts.length} repasse{dayPayouts.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <span className="text-xl font-bold text-primary">
                              {formatCurrency(dayTotal)}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      
                      <AccordionContent className="px-6 pb-6">
                        <div className="space-y-3 pt-4 border-t border-border">
                          {dayPayouts.map((payout, index) => (
                            <div 
                              key={payout.payoutExternalId}
                              className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors"
                            >
                              <div>
                                <p className="font-medium">Repasse #{index + 1}</p>
                                <p className="text-sm text-muted-foreground font-mono">
                                  ID: {payout.payoutExternalId}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(parseISO(payout.dateRead), "HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold">
                                  {formatCurrency(payout.amount)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                );
              })}
            </Accordion>
            
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
            title="Nenhum repasse encontrado"
            description="Não há repasses registrados no momento."
            action={{
              label: "Atualizar",
              onClick: () => window.location.reload()
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}