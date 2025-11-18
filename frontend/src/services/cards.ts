import { apiService } from "@/lib/api";

interface StatusAvaliacoes {
  faltam_1_avaliacao: number;
  faltam_2_avaliacoes: number;
  faltam_3_avaliacoes: number;
}

interface ProjectCard {
  nome: string;
  nota_final: number;
}

interface CardsData {
  total_projetos: number;
  trabalhos_para_avaliar: number;
  trabalhos_avaliados: number;
  avaliadores_ativos: number;
  progresso_geral: number;
  progresso_geral_inicial: number;
  status_avaliacoes: StatusAvaliacoes;
  projects: ProjectCard[];
}

class CardsService {
  async getCardsData(): Promise<CardsData> {
    try {
      const response = await apiService.get<CardsData>('/cards');

      if (response) {
        return response;
      } else {
        throw new Error('Erro ao buscar dados dos cards');
      }
    } catch (error) {
      console.error('Erro ao buscar dados dos cards:', error);
      throw new Error('Erro ao buscar dados dos cards');
    }
  }
}

export const cardsService = new CardsService();
export type { CardsData, StatusAvaliacoes, ProjectCard }; 