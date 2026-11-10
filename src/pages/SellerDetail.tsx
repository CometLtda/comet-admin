import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ArrowRight, User } from "lucide-react";

export default function SellerDetail() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to new StreamerDetail page
    if (sellerId) {
      navigate(`/streamer/${sellerId}`, { replace: true });
    }
  }, [sellerId, navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Detalhes do Vendedor</h1>
          <p className="text-muted-foreground">Página migrada para detalhes do streamer</p>
        </div>
        
        <EmptyState
          icon={<User className="h-8 w-8 text-muted-foreground" />}
          title="Página migrada"
          description="A página de detalhes do streamer foi migrada para a nova API da Comet."
          action={{
            label: "Ir para Detalhes do Streamer",
            onClick: () => navigate(`/streamer/${sellerId || '1'}`)
          }}
        />
      </div>
    </DashboardLayout>
  );
}
