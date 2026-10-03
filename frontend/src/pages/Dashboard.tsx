import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import type { Categoria, KPIStats, Solicitacao, StatusSolicitacao } from '../types';
import { KPICard } from '../components/KPICard';
import {
  Search,
  Plus,
  LogOut,
  Trash2,
  Edit3,
  Clock,
  Download,
  FileText,
  XCircle,
  ArrowUpDown,
  User,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
  usuarioNome?: string;
}

const rotulosStatus: Record<StatusSolicitacao, string> = {
  PENDENTE: 'Aberto',
  EM_ANDAMENTO: 'Em Atendimento',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

const obterCodigo = (solicitacao: Solicitacao) => solicitacao.codigo || String(solicitacao.id);

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, usuarioNome = 'Usuário' }) => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [kpis, setKpis] = useState<KPIStats>({ total: 0, pendentes: 0, em_andamento: 0, concluidos: 0 });

  const [search, setSearch] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [prioridade, setPrioridade] = useState('MEDIA');

  const [historicoModal, setHistoricoModal] = useState<Solicitacao | null>(null);
  const [sidebarAberta, setSidebarAberta] = useState(false);

  // Ordenação
  const [ordemCampo, setOrdemCampo] = useState<'titulo' | 'data'>('data');
  const [ordemDirecao, setOrdemDirecao] = useState<'asc' | 'desc'>('desc');

  const carregarDados = useCallback(async () => {
    try {
      const [resKpis, resCats, resSols] = await Promise.all([
        api.get('/solicitacoes/kpis/'),
        api.get('/categorias/'),
        api.get('/solicitacoes/', {
          params: {
            search: search || undefined,
            status: statusFiltro || undefined,
            categoria: categoriaFiltro || undefined,
          }
        })
      ]);

      setKpis(resKpis.data);
      setCategorias(resCats.data.results || resCats.data);
      setSolicitacoes(resSols.data.results || resSols.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  }, [search, statusFiltro, categoriaFiltro]);

  // Solução para o erro do ESLint no useEffect
  useEffect(() => {
    let ativo = true;
    const buscar = async () => {
      if (ativo) {
        await carregarDados();
      }
    };
    buscar();
    return () => {
      ativo = false;
    };
  }, [carregarDados]);

  const resetForm = () => {
    setEditandoId(null);
    setTitulo('');
    setDescricao('');
    setCategoriaId('');
    setPrioridade('MEDIA');
  };

  const handleAbrirCriacao = () => {
    resetForm();
    if (categorias.length > 0) setCategoriaId(String(categorias[0].id));
    setModalAberto(true);
  };

  const handleAbrirEdicao = (sol: Solicitacao) => {
    if (sol.status !== 'PENDENTE') {
      alert('Trava de Segurança: Somente solicitações com status "Aberto" podem ser alteradas.');
      return;
    }
    setEditandoId(sol.id);
    setTitulo(sol.titulo);
    setDescricao(sol.descricao);
    setCategoriaId(String(sol.categoria));
    setPrioridade(sol.prioridade);
    setModalAberto(true);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        titulo,
        descricao,
        categoria: Number(categoriaId),
        prioridade,
      };

      if (editandoId) {
        await api.put(`/solicitacoes/${editandoId}/`, payload);
      } else {
        await api.post('/solicitacoes/', payload);
      }

      setModalAberto(false);
      resetForm();
      await carregarDados();
    } catch (err) {
      const errorResponse = err as { response?: { data?: { detail?: string } } };
      alert(errorResponse.response?.data?.detail || 'Erro ao salvar solicitação.');
    }
  };

  const handleExcluir = async (sol: Solicitacao) => {
    if (sol.status !== 'PENDENTE') {
      alert('Trava de Segurança: Somente solicitações com status "Aberto" podem ser excluídas.');
      return;
    }

    if (confirm(`Deseja realmente excluir a solicitação ${obterCodigo(sol)}?`)) {
      try {
        await api.delete(`/solicitacoes/${sol.id}/`);
        await carregarDados();
      } catch (err) {
        const errorResponse = err as { response?: { data?: { detail?: string } } };
        alert(errorResponse.response?.data?.detail || 'Erro ao excluir solicitação.');
      }
    }
  };

  const handleAlterarStatus = async (id: number, novoStatus: StatusSolicitacao) => {
    try {
      await api.patch(`/solicitacoes/${id}/alterar_status/`, { status: novoStatus });
      await carregarDados();
    } catch {
      alert('Erro ao alterar status.');
    }
  };

  const handleKpiClique = (status: string) => {
    if (statusFiltro === status) {
      setStatusFiltro('');
    } else {
      setStatusFiltro(status);
    }
  };

  const handleLimparFiltros = () => {
    setSearch('');
    setStatusFiltro('');
    setCategoriaFiltro('');
  };

  const temFiltroAtivo = search !== '' || statusFiltro !== '' || categoriaFiltro !== '';

  const solicitacoesOrdenadas = useMemo(() => {
    return [...solicitacoes].sort((a, b) => {
      if (ordemCampo === 'titulo') {
        const comp = a.titulo.localeCompare(b.titulo);
        return ordemDirecao === 'asc' ? comp : -comp;
      } else {
        const dataA = new Date(a.criado_em).getTime();
        const dataB = new Date(b.criado_em).getTime();
        const valorA = Number.isNaN(dataA) ? a.id : dataA;
        const valorB = Number.isNaN(dataB) ? b.id : dataB;
        return ordemDirecao === 'asc' ? valorA - valorB : valorB - valorA;
      }
    });
  }, [solicitacoes, ordemCampo, ordemDirecao]);

  const toggleOrdem = (campo: 'titulo' | 'data') => {
    if (ordemCampo === campo) {
      setOrdemDirecao(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrdemCampo(campo);
      setOrdemDirecao('asc');
    }
  };

  // Exportar para CSV
  const handleExportarCSV = () => {
    if (solicitacoesOrdenadas.length === 0) {
      alert('Nenhuma solicitação para exportar.');
      return;
    }

    const escaparCampo = (valor: string | number) => `"${String(valor).replace(/"/g, '""')}"`;
    const cabecalho = ['Código', 'Título', 'Categoria', 'Solicitante', 'Status', 'Data de abertura'];
    const linhas = solicitacoesOrdenadas.map((sol) => [
      obterCodigo(sol),
      sol.titulo,
      sol.categoria_nome || '',
      sol.solicitante_nome || '',
      rotulosStatus[sol.status],
      sol.criado_em ? new Date(sol.criado_em).toLocaleString('pt-BR') : '',
    ]);

    const csvContent = '\uFEFF' + [cabecalho, ...linhas].map((linha) =>
      linha.map(escaparCampo).join(';')
    ).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `solicitacoes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Exportar para PDF
  const handleExportarPDF = () => {
    if (solicitacoesOrdenadas.length === 0) {
      alert('Nenhuma solicitação para exportar em PDF.');
      return;
    }
    window.print();
  };

  const inicialUsuario = usuarioNome.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      {/* Botão de Menu Mobile */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-20 print:hidden">
        <h1 className="font-bold text-base">Portal de Solicitações</h1>
        <button onClick={() => setSidebarAberta(!sidebarAberta)} className="p-1 rounded hover:bg-slate-800">
          {sidebarAberta ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Lateral */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-30 h-screen w-64 bg-slate-900 text-white flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out print:hidden
        ${sidebarAberta ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-lg font-bold text-slate-100 leading-tight">
              Portal de Solicitações Internas
            </h1>
          </div>

          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setSidebarAberta(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white text-left"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Painel Geral</span>
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {inicialUsuario || <User className="w-5 h-5" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">{usuarioNome}</p>
              <p className="text-xs text-slate-400">Usuário do Sistema</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-300 hover:text-red-400 hover:bg-slate-800 py-2 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>
      {sidebarAberta && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setSidebarAberta(false)}
          className="fixed inset-0 z-20 bg-slate-950/40 md:hidden print:hidden"
        />
      )}

      {/* Área Principal */}
      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Indicadores KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          <button
            type="button"
            aria-pressed={statusFiltro === ''}
            onClick={() => handleKpiClique('')}
            className={`w-full text-left cursor-pointer transition-all rounded-xl h-28 ${statusFiltro === '' ? 'ring-2 ring-blue-600 shadow-md' : 'hover:opacity-90'}`}
          >
            <KPICard titulo="Total Geral" valor={kpis.total} corBorda="border-slate-500" />
          </button>
          <button
            type="button"
            aria-pressed={statusFiltro === 'PENDENTE'}
            onClick={() => handleKpiClique('PENDENTE')}
            className={`w-full text-left cursor-pointer transition-all rounded-xl h-28 ${statusFiltro === 'PENDENTE' ? 'ring-2 ring-blue-600 shadow-md' : 'hover:opacity-90'}`}
          >
            <KPICard titulo="Abertas" valor={kpis.pendentes} corBorda="border-amber-500" />
          </button>
          <button
            type="button"
            aria-pressed={statusFiltro === 'EM_ANDAMENTO'}
            onClick={() => handleKpiClique('EM_ANDAMENTO')}
            className={`w-full text-left cursor-pointer transition-all rounded-xl h-28 ${statusFiltro === 'EM_ANDAMENTO' ? 'ring-2 ring-blue-600 shadow-md' : 'hover:opacity-90'}`}
          >
            <KPICard titulo="Em Atendimento" valor={kpis.em_andamento} corBorda="border-blue-500" />
          </button>
          <button
            type="button"
            aria-pressed={statusFiltro === 'CONCLUIDO'}
            onClick={() => handleKpiClique('CONCLUIDO')}
            className={`w-full text-left cursor-pointer transition-all rounded-xl h-28 ${statusFiltro === 'CONCLUIDO' ? 'ring-2 ring-blue-600 shadow-md' : 'hover:opacity-90'}`}
          >
            <KPICard titulo="Concluídas" valor={kpis.concluidos} corBorda="border-emerald-500" />
          </button>
        </div>

        {/* Filtros e Ações */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center print:hidden">
          <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por título ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Todos Os Status</option>
              <option value="PENDENTE">Aberto</option>
              <option value="EM_ANDAMENTO">Em Atendimento</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="CANCELADO">Cancelado</option>
            </select>

            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Todas As Categorias</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>

            {temFiltroAtivo && (
              <button
                onClick={handleLimparFiltros}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                title="Limpar todos os filtros"
              >
                <XCircle className="w-4 h-4" /> Limpar filtros
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            <button
              onClick={handleExportarCSV}
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-medium px-3.5 py-2 rounded-lg text-sm transition-colors"
              title="Exportar chamados filtrados para CSV"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </button>

            <button
              onClick={handleExportarPDF}
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-medium px-3.5 py-2 rounded-lg text-sm transition-colors"
              title="Baixar ou Imprimir relatório em PDF"
            >
              <FileText className="w-4 h-4" /> Baixar PDF
            </button>

            <button
              onClick={handleAbrirCriacao}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Nova Solicitação
            </button>
          </div>
        </div>

        {/* Tabela de Resultados */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-4">
                    <button
                      onClick={() => toggleOrdem('data')}
                      className="flex items-center gap-1.5 hover:text-slate-900 font-semibold print:pointer-events-none"
                    >
                      Abertura
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                    </button>
                  </th>
                  <th className="p-4">
                    <button
                      onClick={() => toggleOrdem('titulo')}
                      className="flex items-center gap-1.5 hover:text-slate-900 font-semibold print:pointer-events-none"
                    >
                      Título
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                    </button>
                  </th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Solicitante</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center print:hidden">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {solicitacoesOrdenadas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Nenhuma solicitação encontrada.
                    </td>
                  </tr>
                ) : (
                  solicitacoesOrdenadas.map((sol) => (
                    <tr key={sol.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <time className="block text-slate-700" dateTime={sol.criado_em}>
                          {sol.criado_em ? new Date(sol.criado_em).toLocaleString('pt-BR') : '—'}
                        </time>
                        <span className="block mt-1 font-mono text-xs text-slate-500">
                          {obterCodigo(sol)}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-800">{sol.titulo}</td>
                      <td className="p-4 text-slate-600">{sol.categoria_nome}</td>
                      <td className="p-4 text-slate-600">{sol.solicitante_nome}</td>
                      <td className="p-4">
                        <select
                          value={sol.status}
                          onChange={(e) => void handleAlterarStatus(sol.id, e.target.value as StatusSolicitacao)}
                          className="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-medium print:hidden"
                        >
                          <option value="PENDENTE">Aberto</option>
                          <option value="EM_ANDAMENTO">Em Atendimento</option>
                          <option value="CONCLUIDO">Concluído</option>
                          <option value="CANCELADO">Cancelado</option>
                        </select>
                        <span className="hidden print:inline text-xs font-semibold uppercase">
                          {rotulosStatus[sol.status]}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2 print:hidden">
                        <button
                          title="Histórico"
                          onClick={() => setHistoricoModal(sol)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 rounded"
                        >
                          <Clock className="w-4 h-4" />
                        </button>

                        <button
                          title="Editar"
                          disabled={sol.status !== 'PENDENTE'}
                          onClick={() => handleAbrirEdicao(sol)}
                          className={`p-1.5 rounded ${sol.status === 'PENDENTE' ? 'text-slate-600 hover:text-amber-600' : 'text-slate-300 cursor-not-allowed'}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          title="Excluir"
                          disabled={sol.status !== 'PENDENTE'}
                          onClick={() => void handleExcluir(sol)}
                          className={`p-1.5 rounded ${sol.status === 'PENDENTE' ? 'text-slate-600 hover:text-red-600' : 'text-slate-300 cursor-not-allowed'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Criar/Editar */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              {editandoId ? 'Editar Solicitação' : 'Nova Solicitação'}
            </h2>
            <form onSubmit={(e) => void handleSalvar(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Categoria</label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Descrição</label>
                <textarea
                  required
                  rows={4}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Histórico */}
      {historicoModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              Histórico - {obterCodigo(historicoModal)}
            </h2>
            <div className="max-h-60 overflow-y-auto space-y-3 my-4 pr-1">
              {(historicoModal.historico ?? []).map((h) => (
                <div key={h.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>{h.usuario_nome}</span>
                    <span className="text-slate-400">{new Date(h.data_alteracao).toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-slate-600">{h.acao_realizada}</p>
                </div>
              ))}
              {(historicoModal.historico ?? []).length === 0 && (
                <p className="text-sm text-slate-500">Nenhum histórico disponível.</p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setHistoricoModal(null)}
                className="px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};