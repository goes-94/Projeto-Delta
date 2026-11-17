"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { Users, UserPlus, MoreVertical, Mail, Phone, Calendar, Scissors, Search, BellRing } from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  whatsapp: string;
  email: string;
  historicoServicos: {
    servico: string;
    data: string;
    valor: number;
  }[];
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [agendamentosGeral, setAgendamentosGeral] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  
  // Modais
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [menuAberto, setMenuAberto] = useState<string | null>(null);

  // Estados do formulário de Novo Cliente
  const [novoNome, setNovoNome] = useState("");
  const [novoWhatsapp, setNovoWhatsapp] = useState("");
  const [novoEmail, setNovoEmail] = useState("");

  // 1. Buscar clientes do Firestore em tempo real
  useEffect(() => {
    const unsubscribeClientes = onSnapshot(collection(db, "clientes"), (snapshot) => {
      const lista: Cliente[] = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        nome: docItem.data().nome || "",
        whatsapp: docItem.data().whatsapp || "",
        email: docItem.data().email || "",
        historicoServicos: docItem.data().historicoServicos || [],
      }));
      setClientes(lista);
    });

    // 2. Buscar agendamentos em tempo real para cruzar histórico dinamicamente
    const unsubscribeAgendamentos = onSnapshot(collection(db, "agendamentos"), (snapshot) => {
      const listaAgendamentos = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));
      setAgendamentosGeral(listaAgendamentos);
    });

    return () => {
      unsubscribeClientes();
      unsubscribeAgendamentos();
    };
  }, []);

  // Função auxiliar para juntar o histórico cadastrado com os agendamentos reais do Firestore baseados no WhatsApp
  function obterHistoricoUnificado(cliente: Cliente) {
    const historicoMap = new Map();

    // Adiciona o histórico fixo do documento do cliente
    if (cliente.historicoServicos) {
      cliente.historicoServicos.forEach((item) => {
        const chave = `${item.servico}-${item.data}`;
        historicoMap.set(chave, item);
      });
    }

    // Cruza com os agendamentos reais da coleção "agendamentos" usando o WhatsApp
    agendamentosGeral.forEach((ag) => {
      if (ag.whatsapp && cliente.whatsapp && ag.whatsapp.replace(/\D/g, "") === cliente.whatsapp.replace(/\D/g, "")) {
        if (ag.data && ag.servico) {
          const dataObj = ag.data.toDate ? ag.data.toDate() : new Date(ag.data);
          const dia = String(dataObj.getDate()).padStart(2, "0");
          const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
          const ano = dataObj.getFullYear();
          const dataFormatada = `${dia}/${mes}/${ano}`;

          const chave = `${ag.servico}-${dataFormatada}`;
          historicoMap.set(chave, {
            servico: ag.servico,
            data: dataFormatada,
            valor: Number(ag.valor || 0),
          });
        }
      }
    });

    return Array.from(historicoMap.values());
  }

  // Salvar novo cliente e já puxar agendamentos existentes se houver
  async function handleSalvarNovoCliente(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Busca agendamentos antigos com esse mesmo WhatsApp para já preencher o histórico inicial
      const q = query(collection(db, "agendamentos"), where("whatsapp", "==", novoWhatsapp));
      const snapAgendamentos = await getDocs(q);
      const historicoInicial: any[] = [];

      snapAgendamentos.forEach((docItem) => {
        const ag = docItem.data();
        if (ag.data && ag.servico) {
          const dataObj = ag.data.toDate ? ag.data.toDate() : new Date(ag.data);
          const dia = String(dataObj.getDate()).padStart(2, "0");
          const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
          const ano = dataObj.getFullYear();
          historicoInicial.push({
            servico: ag.servico,
            data: `${dia}/${mes}/${ano}`,
            valor: Number(ag.valor || 0),
          });
        }
      });

      await addDoc(collection(db, "clientes"), {
        nome: novoNome,
        whatsapp: novoWhatsapp,
        email: novoEmail,
        historicoServicos: historicoInicial,
        criadoEm: serverTimestamp(),
      });

      setNovoNome("");
      setNovoWhatsapp("");
      setNovoEmail("");
      setModalAdicionarAberto(false);
      alert("Cliente cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Erro ao cadastrar cliente.");
    }
  }

  // Atualizar cliente existente
  async function handleSalvarEdicao(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteSelecionado) return;

    try {
      const clienteRef = doc(db, "clientes", clienteSelecionado.id);
      await updateDoc(clienteRef, {
        nome: clienteSelecionado.nome,
        whatsapp: clienteSelecionado.whatsapp,
        email: clienteSelecionado.email,
      });

      setModalEditarAberto(false);
      setClienteSelecionado(null);
      alert("Cadastro atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      alert("Erro ao atualizar cadastro.");
    }
  }

  // Excluir cliente
  async function handleExcluirCliente(id: string) {
    if (!window.confirm("Deseja realmente excluir este cliente?")) return;
    try {
      await deleteDoc(doc(db, "clientes", id));
      alert("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      alert("Erro ao excluir cliente.");
    }
  }

  function abrirWhatsApp(telefone: string, mensagemPersonalizada?: string) {
    if (telefone) {
      const numeroFormatado = telefone.replace(/\D/g, "");
      const texto = mensagemPersonalizada ? encodeURIComponent(mensagemPersonalizada) : "";
      window.open(`https://wa.me/55${numeroFormatado}${texto ? `?text=${texto}` : ""}`, "_blank");
    }
  }

  function abrirEmail(email: string) {
    if (email) {
      window.open(`mailto:${email}`, "_blank");
    }
  }

  function calcularDiasInativo(historico: any[]) {
    if (!historico || historico.length === 0) return 0;
    const ultimoServico = historico[historico.length - 1];
    if (!ultimoServico.data) return 0;

    const [dia, mes, ano] = ultimoServico.data.split("/").map(Number);
    const dataUltimoCorte = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    const diferencaEmTempo = hoje.getTime() - dataUltimoCorte.getTime();
    return Math.floor(diferencaEmTempo / (1000 * 3600 * 24));
  }

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.whatsapp.includes(busca)
  );

  const clientesParaLembrete = clientes.filter((c) => {
    const historicoUnificado = obterHistoricoUnificado(c);
    const dias = calcularDiasInativo(historicoUnificado);
    return historicoUnificado.length > 0 && dias >= 15;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Totalizadores */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-gold-500" size={28} /> Gestão de Clientes
          </h1>
          <p className="text-slate-400 text-sm">Controle de clientes, histórico de serviços e lembretes de retorno.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-navy-900 border border-navy-800 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-gold-500/10 rounded-lg text-gold-500">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Cadastrados</p>
              <p className="text-lg font-bold text-white">{clientes.length}</p>
            </div>
          </div>

          <button
            onClick={() => setModalAdicionarAberto(true)}
            className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg"
          >
            <UserPlus size={20} /> Novo Cliente
          </button>
        </div>
      </div>

      {/* Alerta de Clientes no Tempo de Retorno */}
      {clientesParaLembrete.length > 0 && (
        <div className="bg-gradient-to-r from-gold-500/10 via-navy-900 to-navy-900 border border-gold-500/40 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gold-500 text-navy-900 rounded-xl font-bold">
              <BellRing size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Lembretes de Retorno Disponíveis</h3>
              <p className="text-xs text-slate-300">Existem <span className="text-gold-400 font-bold">{clientesParaLembrete.length} cliente(s)</span> há mais de 15 dias sem cortar o cabelo.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {clientesParaLembrete.map((c) => {
              const historicoUnificado = obterHistoricoUnificado(c);
              const dias = calcularDiasInativo(historicoUnificado);
              return (
                <button
                  key={c.id}
                  onClick={() =>
                    abrirWhatsApp(
                      c.whatsapp,
                      `Olá ${c.nome}! Passando para lembrar que já faz ${dias} dias desde o seu último corte aqui no Tech Lion. Que tal garantir seu horário esta semana? 🦁✂️`
                    )
                  }
                  className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 border border-gold-500/30 rounded-lg text-xs text-gold-400 font-medium flex items-center gap-1.5 transition"
                >
                  <span>{c.nome.split(" ")[0]} ({dias}d)</span>
                  <Phone size={12} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Barra de Pesquisa */}
      <div className="bg-navy-900 border border-navy-800 p-4 rounded-xl flex items-center gap-3">
        <Search size={20} className="text-slate-400" />
        <input
          type="text"
          placeholder="Pesquisar cliente por nome ou WhatsApp..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-transparent text-white placeholder-slate-500 text-sm outline-none"
        />
      </div>

      {/* Tabela em Formato de Linhas */}
      <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-navy-800 text-slate-400 text-xs uppercase bg-navy-950/50">
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold">WhatsApp</th>
                <th className="p-4 font-semibold">E-mail</th>
                <th className="p-4 font-semibold text-center">Último Atendimento</th>
                <th className="p-4 font-semibold text-center">Ações Rápidas</th>
                <th className="p-4 font-semibold text-right">Opções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 text-sm">
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => {
                  const historicoUnificado = obterHistoricoUnificado(cliente);
                  const ultimoServico = historicoUnificado[historicoUnificado.length - 1];
                  const diasInativo = calcularDiasInativo(historicoUnificado);

                  return (
                    <tr key={cliente.id} className="hover:bg-navy-800/40 transition">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-9 h-9 bg-navy-800 rounded-full flex items-center justify-center text-gold-500 font-bold border border-navy-700 text-xs">
                          {cliente.nome
                            ? cliente.nome.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                            : "CL"}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{cliente.nome}</span>
                          {diasInativo >= 15 && (
                            <span className="text-[10px] bg-gold-500/10 text-gold-400 px-1.5 py-0.5 rounded border border-gold-500/20">
                              {diasInativo} dias sem vir
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-slate-300">
                        {cliente.whatsapp || <span className="text-slate-600 italic">Não informado</span>}
                      </td>

                      <td className="p-4 text-slate-300">
                        {cliente.email || <span className="text-slate-600 italic">Não informado</span>}
                      </td>

                      <td className="p-4 text-center text-slate-300">
                        {ultimoServico ? (
                          <div className="text-xs">
                            <span className="font-medium text-white">{ultimoServico.servico}</span>
                            <span className="block text-slate-400">{ultimoServico.data}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Nenhum</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() =>
                              abrirWhatsApp(
                                cliente.whatsapp,
                                `Olá ${cliente.nome}! Passando para lembrar que já faz alguns dias desde o seu último corte aqui no Tech Lion. Que tal garantir seu horário esta semana? 🦁✂️`
                              )
                            }
                            disabled={!cliente.whatsapp}
                            className="p-2 bg-green-950/40 border border-green-900/50 text-green-400 rounded-lg hover:bg-green-900/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Enviar Lembrete no WhatsApp"
                          >
                            <Phone size={16} />
                          </button>
                          <button
                            onClick={() => abrirEmail(cliente.email)}
                            disabled={!cliente.email}
                            className="p-2 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded-lg hover:bg-gold-500/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Enviar E-mail"
                          >
                            <Mail size={16} />
                          </button>
                        </div>
                      </td>

                      <td className="p-4 text-right relative">
                        <button
                          onClick={() => setMenuAberto(menuAberto === cliente.id ? null : cliente.id)}
                          className="p-2 text-slate-400 hover:text-white rounded-lg transition"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {menuAberto === cliente.id && (
                          <div className="absolute right-6 top-12 bg-navy-800 border border-navy-700 rounded-xl shadow-2xl z-20 w-48 py-1 text-left">
                            <button
                              onClick={() => {
                                setClienteSelecionado(cliente);
                                setModalHistoricoAberto(true);
                                setMenuAberto(null);
                              }}
                              className="w-full px-4 py-2.5 text-xs text-white hover:bg-navy-700 flex items-center gap-2 transition"
                            >
                              <Scissors size={14} className="text-gold-500" /> Ver Serviços Contratados
                            </button>
                            <button
                              onClick={() => {
                                setClienteSelecionado(cliente);
                                setModalEditarAberto(true);
                                setMenuAberto(null);
                              }}
                              className="w-full px-4 py-2.5 text-xs text-white hover:bg-navy-700 flex items-center gap-2 transition"
                            >
                              Editar Cadastro
                            </button>
                            <button
                              onClick={() => {
                                handleExcluirCliente(cliente.id);
                                setMenuAberto(null);
                              }}
                              className="w-full px-4 py-2.5 text-xs text-red-400 hover:bg-navy-700 flex items-center gap-2 transition border-t border-navy-700/50"
                            >
                              Excluir Cliente
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Visualizar Serviços Contratados (Com Histórico Unificado) */}
      {modalHistoricoAberto && clienteSelecionado && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 border border-navy-800 p-6 rounded-2xl w-full max-w-lg relative shadow-2xl">
            <button
              onClick={() => setModalHistoricoAberto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Scissors className="text-gold-500" size={20} /> Histórico de Serviços
            </h2>
            <p className="text-xs text-slate-400 mb-4">Cliente: <span className="text-white font-semibold">{clienteSelecionado.nome}</span></p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {(() => {
                const historicoUnificado = obterHistoricoUnificado(clienteSelecionado);
                return historicoUnificado.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-6">Nenhum serviço registrado no histórico deste cliente.</p>
                ) : (
                  historicoUnificado.map((item, index) => (
                    <div key={index} className="bg-navy-800/60 p-3 rounded-lg border border-navy-700 text-xs flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium text-sm">{item.servico}</p>
                        <p className="text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={12} /> {item.data}
                        </p>
                      </div>
                      <span className="text-gold-400 font-bold">
                        {Number(item.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  ))
                );
              })()}
            </div>

            <button
              onClick={() => setModalHistoricoAberto(false)}
              className="w-full mt-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-white font-semibold rounded-xl text-xs transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Adicionar Novo Cliente */}
      {modalAdicionarAberto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 border border-navy-800 p-6 rounded-2xl w-full max-w-md relative shadow-2xl">
            <button
              onClick={() => setModalAdicionarAberto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Adicionar Novo Cliente</h2>
            
            <form onSubmit={handleSalvarNovoCliente} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white text-sm outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">WhatsApp (com DDD)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 11988887777"
                  value={novoWhatsapp}
                  onChange={(e) => setNovoWhatsapp(e.target.value)}
                  className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white text-sm outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: carlos@email.com"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white text-sm outline-none focus:border-gold-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold rounded-xl transition mt-2"
              >
                Cadastrar Cliente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Cliente */}
      {modalEditarAberto && clienteSelecionado && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 border border-navy-800 p-6 rounded-2xl w-full max-w-md relative shadow-2xl">
            <button
              onClick={() => setModalEditarAberto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Editar Cadastro do Cliente</h2>
            
            <form onSubmit={handleSalvarEdicao} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={clienteSelecionado.nome}
                  onChange={(e) => setClienteSelecionado({ ...clienteSelecionado, nome: e.target.value })}
                  className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white text-sm outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">WhatsApp (com DDD)</label>
                <input
                  type="text"
                  required
                  value={clienteSelecionado.whatsapp}
                  onChange={(e) => setClienteSelecionado({ ...clienteSelecionado, whatsapp: e.target.value })}
                  className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white text-sm outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">E-mail</label>
                <input
                  type="email"
                  required
                  value={clienteSelecionado.email}
                  onChange={(e) => setClienteSelecionado({ ...clienteSelecionado, email: e.target.value })}
                  className="w-full mt-1 p-3등록 bg-navy-800 border border-navy-700 text-white text-sm outline-none focus:border-gold-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold rounded-xl transition mt-2"
              >
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}