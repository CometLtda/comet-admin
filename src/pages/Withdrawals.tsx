import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ArrowRight, Banknote } from "lucide-react";

export default function Withdrawals() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Saques</h1>
          <p className="text-muted-foreground">Gerenciamento de saques (migrado para Transferências)</p>
        </div>
        
        <EmptyState
          icon={<Banknote className="h-8 w-8 text-muted-foreground" />}
          title="Funcionalidade migrada"
          description="A funcionalidade de saques foi migrada para a página de transferências na API da Comet."
          action={{
            label: "Ir para Transferências",
            onClick: () => navigate("/transfers")
          }}
        />
      </div>
    </DashboardLayout>
  );
}
