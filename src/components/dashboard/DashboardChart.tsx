import { lazy, Suspense, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiService } from "@/services/api";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const ApexChart = lazy(() => import("react-apexcharts"));
const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const DashboardChart = () => {
  const [days, setDays] = useState(30);
  const { theme } = useTheme();
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["revenue-daily", days],
    queryFn: () => apiService.getDashboardData(days),
  });

  const chartData = useMemo(() => data.map(item => ({ x: new Date(item.date).getTime(), revenue: item.revenue, labels: item.labelsCount })), [data]);
  const totalRevenue = useMemo(() => data.reduce((total, item) => total + item.revenue, 0), [data]);
  const totalLabels = useMemo(() => data.reduce((total, item) => total + item.labelsCount, 0), [data]);

  const options = useMemo<ApexOptions>(() => ({
    chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false }, foreColor: theme === "dark" ? "#a1a1aa" : "#64748b", animations: { enabled: false } },
    colors: ["#2878f0", "#9b7cf6"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: [3, 2] },
    fill: { type: "gradient", gradient: { opacityFrom: 0.28, opacityTo: 0.03, stops: [0, 90, 100] } },
    grid: { borderColor: theme === "dark" ? "#30303a" : "#e2e8f0", strokeDashArray: 4, padding: { left: 8, right: 8 } },
    xaxis: { type: "datetime", labels: { datetimeUTC: true, format: "dd/MM", rotate: 0, hideOverlappingLabels: true }, axisBorder: { show: false }, axisTicks: { show: false }, tooltip: { enabled: false } },
    yaxis: [
      { seriesName: "Receita", title: { text: "Receita (R$)" }, labels: { formatter: value => `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}` } },
      { seriesName: "Etiquetas", opposite: true, title: { text: "Etiquetas" }, labels: { formatter: value => Math.round(value).toLocaleString("pt-BR") } },
    ],
    tooltip: { shared: true, intersect: false, x: { format: "dd/MM/yyyy" }, y: { formatter: (value, { seriesIndex }) => seriesIndex === 0 ? formatCurrency(value) : Math.round(value).toLocaleString("pt-BR") } },
    legend: { position: "top", horizontalAlign: "left", labels: { colors: theme === "dark" ? "#e4e4e7" : "#334155" } },
    markers: { size: 0, hover: { size: 5 } },
    noData: { text: "Sem dados para o período selecionado" },
  }), [theme]);

  return <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card><CardHeader><CardDescription>Receita no período</CardDescription><CardTitle className="text-3xl">{isLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : formatCurrency(totalRevenue)}</CardTitle></CardHeader></Card>
      <Card><CardHeader><CardDescription>Etiquetas vendidas</CardDescription><CardTitle className="text-3xl">{isLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : totalLabels.toLocaleString("pt-BR")}</CardTitle></CardHeader></Card>
    </div>
    <Card className="glass-strong">
      <CardHeader><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><CardTitle>Receita diária</CardTitle><CardDescription>Receita e etiquetas vendidas por dia</CardDescription></div>
        <Select value={String(days)} onValueChange={value => setDays(Number(value))}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent>
          {[7, 15, 30, 60, 90, 365].map(value => <SelectItem key={value} value={String(value)}>Últimos {value} dias</SelectItem>)}
        </SelectContent></Select>
      </div></CardHeader>
      <CardContent>
        {isError ? <div className="h-[380px] flex items-center justify-center text-destructive">Erro ao carregar dados do dashboard</div> : isLoading ? <div className="h-[380px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> :
          <Suspense fallback={<div className="h-[380px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <ApexChart type="area" height={380} options={options} series={[{ name: "Receita", data: chartData.map(item => ({ x: item.x, y: item.revenue })) }, { name: "Etiquetas", data: chartData.map(item => ({ x: item.x, y: item.labels })) }]} />
          </Suspense>}
      </CardContent>
    </Card>
  </div>;
};

export default DashboardChart;
