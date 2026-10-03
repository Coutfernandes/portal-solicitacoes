export type StatusSolicitacao = 'ABERTO' | 'EM_ATENDIMENTO' | 'CONCLUIDO';
export type PrioridadeSolicitacao = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export interface Categoria {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface HistoricoSolicitacao {
  id: number;
  solicitacao: number;
  usuario: number;
  usuario_nome: string;
  acao_realizada: string;
  data_alteracao: string;
}

export interface Solicitacao {
  id: number;
  codigo: string;
  titulo: string;
  descricao: string;
  categoria: number;
  categoria_nome: string;
  solicitante: number;
  solicitante_nome: string;
  data_criacao: string;
  status: StatusSolicitacao;
  prioridade: PrioridadeSolicitacao;
  historico: HistoricoSolicitacao[];
}

export interface KPIStats {
  total: number;
  abertas: number;
  em_atendimento: number;
  concluidas: number;
}