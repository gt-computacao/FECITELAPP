import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Users,
  Trophy,
  Medal,
  Award
} from "lucide-react";
import { cardsService, CardsData } from "@/services/cards";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [dashboardData, setDashboardData] = useState<CardsData>({
    total_projetos: 0,
    trabalhos_para_avaliar: 0,
    trabalhos_avaliados: 0,
    avaliadores_ativos: 0,
    progresso_geral_inicial: 0,
    progresso_geral: 0,
    status_avaliacoes: {
      faltam_1_avaliacao: 0,
      faltam_2_avaliacoes: 0,
      faltam_3_avaliacoes: 0
    },
    projects: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCardsData = async () => {
      try {
        setLoading(true);
        const data = await cardsService.getCardsData();
        setDashboardData(data);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCardsData();
    const interval = setInterval(fetchCardsData, 30000);
    return () => clearInterval(interval);
  }, [toast]);

  const handleCardClick = (type: 'all_projects' | 'evaluators' | 'pending' | 'evaluated' | 'missing_1' | 'missing_2' | 'missing_3') => {
    if (type === 'all_projects') {
      navigate('/dashboard/projetos');
    } else if (type === 'evaluators') {
      navigate('/dashboard/usuarios?role=avaliador');
    } else {
      navigate(`/dashboard/projetos?status=${type}`);
    }
  };

  const cards = [
    {
      title: "Total de Projetos",
      value: dashboardData.total_projetos,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Projetos inscritos na FECITEL",
      clickable: true,
      type: 'all_projects' as const
    },
    {
      title: "Trabalhos para Avaliar",
      value: dashboardData.trabalhos_para_avaliar,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Projetos sem nenhuma avaliação",
      clickable: true,
      type: 'pending' as const
    },
    {
      title: "Trabalhos Avaliados",
      value: dashboardData.trabalhos_avaliados,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Projetos com ao menos 1 avaliação concluída",
      clickable: true,
      type: 'evaluated' as const
    },
    {
      title: "Avaliadores Ativos",
      value: dashboardData.avaliadores_ativos,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Participando da avaliação",
      clickable: true,
      type: 'evaluators' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Painel de Controle</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema FECITEL - acompanhe os principais indicadores
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-ifms-green-dark">
                    <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={index} 
                className={`hover:shadow-lg transition-shadow ${card.clickable ? 'cursor-pointer hover:scale-105' : ''}`}
                onClick={card.clickable ? () => handleCardClick(card.type!) : undefined}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-ifms-green-dark">
                    {card.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Seção de resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-ifms-green-dark">
              Progresso das Avaliações dos Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Progresso Geral Inicial - Projetos que começaram a ser avaliados */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Projetos em Avaliação</span>
                    <p className="text-xs text-muted-foreground">Projetos que já começaram a ser avaliados</p>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {dashboardData.progresso_geral_inicial}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${dashboardData.progresso_geral_inicial}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {dashboardData.trabalhos_avaliados} de {dashboardData.total_projetos} projetos
                </div>
              </div>

              {/* Progresso Geral - Projetos que terminaram */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Projetos Concluídos</span>
                    <p className="text-xs text-muted-foreground">Projetos com todas as 3 avaliações finalizadas</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {dashboardData.progresso_geral}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${dashboardData.progresso_geral}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((dashboardData.progresso_geral / 100) * dashboardData.total_projetos)} de {dashboardData.total_projetos} projetos
                </div>
              </div>

              {/* Resumo estatístico */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Em avaliação:</span>
                    <span className="font-medium text-blue-600">{dashboardData.trabalhos_avaliados}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Pendentes:</span>
                    <span className="font-medium text-orange-600">{dashboardData.trabalhos_para_avaliar}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-ifms-green-dark">
              Status dos Projetos avaliados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div 
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                onClick={() => handleCardClick('missing_1')}
              >
                <span className="text-sm">Projetos que faltam 1 avaliação para conclusão</span>
                <span className="text-sm font-medium text-yellow-600">{dashboardData.status_avaliacoes.faltam_1_avaliacao}</span>
              </div>
              <div 
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                onClick={() => handleCardClick('missing_2')}
              >
                <span className="text-sm">Projetos que faltam 2 avaliações para conclusão</span>
                <span className="text-sm font-medium text-purple-600">{dashboardData.status_avaliacoes.faltam_2_avaliacoes}</span>
              </div>
              <div 
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                onClick={() => handleCardClick('missing_3')}
              >
                <span className="text-sm">Projetos que faltam 3 avaliações para conclusão</span>
                <span className="text-sm font-medium text-red-600">{dashboardData.status_avaliacoes.faltam_3_avaliacoes}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total pendente</span>
                  <span className="text-sm font-bold text-ifms-green-dark">
                    {dashboardData.status_avaliacoes.faltam_1_avaliacao + dashboardData.status_avaliacoes.faltam_2_avaliacoes + dashboardData.status_avaliacoes.faltam_3_avaliacoes} / {dashboardData.total_projetos}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-ifms-green-dark flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Campeões da Feira
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
              ))}
            </div>
          ) : dashboardData.projects.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum projeto avaliado ainda
            </p>
          ) : (
            <div className="space-y-3">
              {dashboardData.projects.map((project, index) => {
                const getRankIcon = () => {
                  if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
                  if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
                  if (index === 2) return <Award className="h-5 w-5 text-amber-600" />;
                  return <span className="text-sm font-bold text-muted-foreground w-5">{index + 1}º</span>;
                };

                const getRankColor = () => {
                  if (index === 0) return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300";
                  if (index === 1) return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300";
                  if (index === 2) return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300";
                  return "bg-white border-gray-200";
                };

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 ${getRankColor()} transition-all hover:shadow-md`}
                  >
                    <div className="flex-shrink-0">
                      {getRankIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {project.nome}
                      </h3>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-lg font-bold text-ifms-green-dark">
                        {project.nota_final.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { HomePage }; 