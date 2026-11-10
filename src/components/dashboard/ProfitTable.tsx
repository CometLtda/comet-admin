import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiService } from "@/services/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const ProfitTable = () => {
  const [days, setDays] = useState(30);
  const { data: profitData = [], isLoading, isError } = useQuery({ queryKey: ["profit-daily", days], queryFn: () => apiService.getProfitData(days) });
  const data = useMemo(() => [...profitData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [profitData]);
  const totals = useMemo(() => data.reduce((sum, row) => ({ revenue: sum.revenue + row.revenue, baseCost: sum.baseCost + row.baseCost, profit: sum.profit + row.profit }), { revenue: 0, baseCost: 0, profit: 0 }), [data]);
  return <div className="space-y-6">
    <div className="flex justify-end"><Select value={String(days)} onValueChange={value => setDays(Number(value))}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent>{[7, 15, 30, 60, 90, 365].map(value => <SelectItem key={value} value={String(value)}>Últimos {value} dias</SelectItem>)}</SelectContent></Select></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardHeader><CardDescription>Receita</CardDescription><CardTitle>{formatCurrency(totals.revenue)}</CardTitle></CardHeader></Card><Card><CardHeader><CardDescription>Custo base</CardDescription><CardTitle>{formatCurrency(totals.baseCost)}</CardTitle></CardHeader></Card><Card><CardHeader><CardDescription>Lucro</CardDescription><CardTitle className="text-primary">{formatCurrency(totals.profit)}</CardTitle></CardHeader></Card></div>
    <Card><CardHeader><CardTitle>Lucro diário</CardTitle><CardDescription>Receita, custo base e lucro por dia</CardDescription></CardHeader><CardContent>{isLoading ? <div className="py-12 text-center text-muted-foreground">Carregando...</div> : isError ? <div className="py-12 text-center text-destructive">Erro ao carregar dados de lucro</div> : <div className="rounded-md border overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead className="text-right">Etiquetas</TableHead><TableHead className="text-right">Receita</TableHead><TableHead className="text-right">Custo base</TableHead><TableHead className="text-right">Lucro</TableHead></TableRow></TableHeader><TableBody>{data.map((item, index) => <TableRow key={`${item.date}-${index}`}><TableCell>{format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell><TableCell className="text-right">{item.labelsCount.toLocaleString("pt-BR")}</TableCell><TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell><TableCell className="text-right">{formatCurrency(item.baseCost)}</TableCell><TableCell className="text-right font-semibold text-primary">{formatCurrency(item.profit)}</TableCell></TableRow>)}</TableBody></Table></div>}</CardContent></Card>
  </div>;
};

export default ProfitTable;
