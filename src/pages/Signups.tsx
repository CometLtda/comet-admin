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
import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { apiService, SignupUserItem } from "@/services/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// "2026-11-10T00:00:00" -> local Date for that calendar day (no timezone shifting).
const parseDay = (value: string) => {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatDay = (value: string) => {
  const label = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(parseDay(value));
  return label.charAt(0).toUpperCase() + label.slice(1);
};

// Timestamps from the API are already in Brazil time and have no zone suffix, so they render as-is.
const formatTime = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

const origin = (user: SignupUserItem) => {
  const parts = [user.utmSource, user.utmMedium].filter(Boolean);
  return parts.length ? parts.join(" / ") : null;
};

const Signups = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, isLoading, error } = useQuery({
    queryKey: ["signups", page, pageSize],
    queryFn: () => apiService.getSignups(page, pageSize),
    placeholderData: previous => previous,
  });

  const openUser = (user: SignupUserItem) => navigate(`/usuarios/${user.publicId}`);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Cadastros</h1>
            <p className="text-muted-foreground">
              Novos usuários da plataforma, agrupados por dia{data ? ` · ${data.totalCount} no total` : ""}
            </p>
          </div>
          <Select value={String(pageSize)} onValueChange={value => { setPageSize(Number(value)); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map(value => <SelectItem key={value} value={String(value)}>{value} por página</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <p className="py-8 text-center text-destructive">Erro ao carregar os cadastros</p>
        ) : isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : data?.days.length ? (
          <>
            {data.days.map(day => (
              <Card key={day.date}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {formatDay(day.date)}
                    <Badge variant="secondary">{day.totalSignups} {day.totalSignups === 1 ? "cadastro" : "cadastros"}</Badge>
                  </CardTitle>
                  {day.users.length < day.totalSignups && (
                    <CardDescription>Mostrando {day.users.length} nesta página — o restante do dia está na página adjacente.</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Hora</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Origem</TableHead>
                          <TableHead>Campanha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {day.users.map(user => (
                          <TableRow key={user.publicId} className="cursor-pointer" onClick={() => openUser(user)}>
                            <TableCell className="text-muted-foreground">{formatTime(user.createdAt)}</TableCell>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell className="text-muted-foreground">{user.phone || "—"}</TableCell>
                            <TableCell>{origin(user) ?? <span className="text-muted-foreground">Direto / orgânico</span>}</TableCell>
                            <TableCell className="text-muted-foreground">{user.utmCampaign || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Página {data.page} de {data.totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="mr-1 h-4 w-4" />Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>
                  Próxima<ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState icon={<UserPlus className="h-8 w-8 text-muted-foreground" />} title="Nenhum cadastro encontrado" description="Ainda não há usuários cadastrados com data de criação registrada." />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Signups;
