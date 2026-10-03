import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { api } from '../services/api';
import type { Categoria, KPIStats, Solicitacao, StatusSolicitacao } from '../types/index';
import { KPICard } from '../components/KPICard';
import { Search, Plus, LogOut, Trash2, Edit3, Clock } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [kpis, setKpis] = useState<KPIStats>({ total: 0, abertas: 0, em_atendimento: 0, concluidas: 0 });

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

  const carregarDados = async () => {
    try {
      const [resKpis, resCats, resSols] = await Promise.all([
        api.get('/solicitacoes/kpis/'),
        api.get('/categorias/'),
        api.get('/solicitacoes/', {
          params: {
            search: search || undefined,
            status: statusFiltro || undefined,
            categoria: categoriaFiltro || undefined,
          },
        }),
      ]);

      setKpis(resKpis.data);
      setCategorias(resCats.data.results || resCats.data);
      setSolicitacoes(resSols.data.results || resSols.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  useEffect(() => {
    let ativo = true;

    const buscar = async () => {
      try {
        const [resKpis, resCats, resSols] = await Promise.all([
          api.get('/solicitacoes/kpis/'),
          api.get('/categorias/'),
          api.get('/solicitacoes/', {
            params: {
              search: search || undefined,
              status: statusFiltro || undefined,
              categoria: categoriaFiltro || undefined,
            },
          }),
        ]);

        if (ativo) {
          setKpis(resKpis.data);
          setCategorias(resCats.data.results || resCats.data);
          setSolicitacoes(resSols.data.results || resSols.data);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    };

    buscar();

    return () => {
      ativo = false;
    };
  }, [search, statusFiltro, categoriaFiltro]);

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
    if (sol.status !== 'ABERTO') {
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
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.detail || 'Erro ao salvar solicitação.');
      } else {
        alert('Erro ao salvar solicitação.');
      }
    }
  };

  const handleExcluir = async (sol: Solicitacao) => {
    if (sol.status !== 'ABERTO') {
      alert('Trava de Segurança: Somente solicitações com status "Aberto" podem ser excluídas.');
      return;
    }

    if (confirm(`Deseja realmente excluir a solicitação ${sol.codigo}?`)) {
      try {
        await api.delete(`/solicitacoes/${sol.id}/`);
        await carregarDados();
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          alert(err.response?.data?.detail || 'Erro ao excluir solicitação.');
        } else {
          alert('Erro ao excluir solicitação.');
        }
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Portal de Solicitações</h1>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard titulo="Total Geral" valor={kpis.total} corBorda="border-slate-500" />
          <KPICard titulo="Abertas" valor={kpis.abertas} corBorda="border-amber-500" />
          <KPICard titulo="Em Atendimento" valor={kpis.em_atendimento} corBorda="border-blue-500" />
          <KPICard titulo="Concluídas" valor={kpis.concluidas} corBorda="border-emerald-500" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
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
              <option value="ABERTO">Aberto</option>
              <option value="EM_ATENDIMENTO">Em Atendimento</option>
              <option value="CONCLUIDO">Concluído</option>
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
          </div>

          <button
            onClick={handleAbrirCriacao}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nova Solicitação
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-4">Código</th>
                  <th className="p-4">Título</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Solicitante</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {solicitacoes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Nenhuma solicitação encontrada.
                    </td>
                  </tr>
                ) : (
                  solicitacoes.map((sol) => (
                    <tr key={sol.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono font-medium text-slate-700">{sol.codigo}</td>
                      <td className="p-4 font-medium text-slate-800">{sol.titulo}</td>
                      <td className="p-4 text-slate-600">{sol.categoria_nome}</td>
                      <td className="p-4 text-slate-600">{sol.solicitante_nome}</td>
                      <td className="p-4">
                        <select
                          value={sol.status}
                          onChange={(e) => handleAlterarStatus(sol.id, e.target.value as StatusSolicitacao)}
                          className="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-medium"
                        >
                          <option value="ABERTO">Aberto</option>
                          <option value="EM_ATENDIMENTO">Em Atendimento</option>
                          <option value="CONCLUIDO">Concluído</option>
                        </select>
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <button
                          title="Histórico"
                          onClick={() => setHistoricoModal(sol)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 rounded cursor-pointer"
                        >
                          <Clock className="w-4 h-4" />
                        </button>

                        <button
                          title="Editar"
                          disabled={sol.status !== 'ABERTO'}
                          onClick={() => handleAbrirEdicao(sol)}
                          className={`p-1.5 rounded ${sol.status === 'ABERTO' ? 'text-slate-600 hover:text-amber-600 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          title="Excluir"
                          disabled={sol.status !== 'ABERTO'}
                          onClick={() => handleExcluir(sol)}
                          className={`p-1.5 rounded ${sol.status === 'ABERTO' ? 'text-slate-600 hover:text-red-600 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
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

      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              {editandoId ? 'Editar Solicitação' : 'Nova Solicitação'}
            </h2>
            <form onSubmit={handleSalvar} className="space-y-4">
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
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historicoModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              Histórico - {historicoModal.codigo}
            </h2>
            <div className="max-h-60 overflow-y-auto space-y-3 my-4 pr-1">
              {historicoModal.historico.map((h) => (
                <div key={h.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>{h.usuario_nome}</span>
                    <span className="text-slate-400">{new Date(h.data_alteracao).toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-slate-600">{h.acao_realizada}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setHistoricoModal(null)}
                className="px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg cursor-pointer"
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