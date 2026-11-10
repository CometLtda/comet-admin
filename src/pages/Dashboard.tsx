import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardChart from "@/components/dashboard/DashboardChart";
import ProfitTable from "@/components/dashboard/ProfitTable";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CONFIG } from "@/config/constants";
import { BarChart3, TrendingUp } from "lucide-react";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl glass-strong shadow-modern p-8 mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10"></div>
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-primary/10 backdrop-blur-sm">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text">
                  Dashboard {CONFIG.PLATFORM_NAME}
                </h1>
                <p className="text-muted-foreground text-lg">
                  Visualize seus dados em tempo real com insights avançados
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="profits" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Lucros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6">
            <DashboardChart />
          </TabsContent>

          <TabsContent value="profits" className="space-y-6">
            <Card className="glass-strong shadow-modern hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Análise de Lucros</CardTitle>
                    <CardDescription>
                      Detalhamento completo dos lucros por categoria e período
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ProfitTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
