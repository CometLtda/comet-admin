import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader2, Search as SearchIcon, User, CheckCircle, XCircle, Shield } from "lucide-react";
import { apiService } from "@/services/api";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['search-streamers', currentSearch, currentPage],
    queryFn: () => apiService.searchStreamers(currentSearch, currentPage, 20),
    enabled: !!currentSearch,
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setCurrentSearch(searchTerm.trim());
      setCurrentPage(1);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Pesquisa de Streamers</h1>
          <p className="text-muted-foreground">Busque por nome, e-mail, nome de usuário ou documento</p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Digite para pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={!searchTerm.trim()}>
            <SearchIcon className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data && data.items.length > 0 ? (
          <div className="space-y-4">
            {data.items.map((streamer) => (
              <Card 
                key={streamer.id} 
                className="glass-strong shadow-modern cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/streamer/${streamer.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {streamer.profileImageUrl ? (
                      <img 
                        src={streamer.profileImageUrl} 
                        alt={streamer.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{streamer.name}</h3>
                        {streamer.isVerified && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {streamer.has2FA && (
                          <Shield className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">@{streamer.username}</p>
                      <p className="text-sm text-muted-foreground">{streamer.email}</p>
                      <p className="text-sm text-muted-foreground">Documento: {streamer.document}</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          streamer.isActive 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {streamer.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                        
                        <span className="text-sm text-muted-foreground">
                          Cadastrado em: {formatDate(streamer.dateCreated)}
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium text-primary">
                          Saldo: {formatCurrency(streamer.balance)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {data.pagination && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Página {data.pagination.currentPage} de {data.pagination.totalPages} 
                  ({data.pagination.totalItems} resultados)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={!data.pagination.hasPreviousPage}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={!data.pagination.hasNextPage}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : currentSearch ? (
          <EmptyState
            icon={<SearchIcon className="h-8 w-8 text-muted-foreground" />}
            title="Nenhum resultado encontrado"
            description="Tente buscar com outros termos."
          />
        ) : (
          <EmptyState
            icon={<SearchIcon className="h-8 w-8 text-muted-foreground" />}
            title="Faça uma pesquisa"
            description="Digite um termo de busca e clique em 'Buscar' para encontrar streamers."
          />
        )}
      </div>
    </DashboardLayout>
  );
}
