export type StatusSolicitacao = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
export type PrioridadeSolicitacao = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export interface Categoria {
  id: number;
  nome: string;
  ativo?: boolean;
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
  codigo?: string;
  titulo: string;
  descricao: string;
  categoria: number;
  categoria_nome: string;
  solicitante: number;
  solicitante_nome: string;
  criado_em: string;
  atualizado_em: string;
  status: StatusSolicitacao;
  prioridade: PrioridadeSolicitacao;
  historico?: HistoricoSolicitacao[];
}

export interface KPIStats {
  total: number;
  pendentes: number;
  em_andamento: number;
  concluidos: number;
}