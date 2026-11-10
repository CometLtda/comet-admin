import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Eye } from "lucide-react";
import { apiService } from "@/services/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const TopSellers = () => {
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const { data, isLoading, error } = useQuery({ queryKey: ["top-sellers", days], queryFn: () => apiService.getStreamerRank(days) });

  return <DashboardLayout><div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div><h1 className="text-3xl font-bold">Ranking</h1><p className="text-muted-foreground">Maiores vendedores no período selecionado</p></div>
      <Select value={String(days)} onValueChange={value => setDays(Number(value))}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent>
        {[7, 15, 30, 60, 90, 365].map(value => <SelectItem key={value} value={String(value)}>Últimos {value} dias</SelectItem>)}
      </SelectContent></Select>
    </div>
    <Card><CardHeader><CardTitle>Top vendedores</CardTitle><CardDescription>Os 20 usuários com maior volume de vendas nos últimos {days} dias</CardDescription></CardHeader><CardContent>
      {error ? <p className="py-8 text-center text-destructive">Erro ao carregar o ranking</p> : isLoading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div> : data?.length ? <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>#</TableHead><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Etiquetas</TableHead><TableHead className="text-right">Total vendido</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{data.map((user, index) => <TableRow key={user.userPublicId} className="cursor-pointer" onClick={() => navigate(`/usuarios/${user.userPublicId}`)}><TableCell><Badge variant={index < 3 ? "default" : "secondary"}>{index + 1}</Badge></TableCell><TableCell className="font-medium">{user.name}</TableCell><TableCell className="text-muted-foreground">{user.email}</TableCell><TableCell className="text-right">{user.labelsCount}</TableCell><TableCell className="text-right font-medium">{formatCurrency(user.totalPrice)}</TableCell><TableCell><div className="flex justify-end"><Button size="sm" variant="outline" onClick={event => { event.stopPropagation(); navigate(`/usuarios/${user.userPublicId}`); }}><Eye className="mr-1 h-4 w-4"/>Ver usuário</Button></div></TableCell></TableRow>)}</TableBody></Table></div> : <EmptyState icon={<TrendingUp className="h-8 w-8 text-muted-foreground"/>} title="Nenhum vendedor encontrado" description="Não há vendas registradas no período."/>}
    </CardContent></Card>
  </div></DashboardLayout>;
};

export default TopSellers;
