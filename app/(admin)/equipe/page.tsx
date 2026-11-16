"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, query, getDocs, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { UserPlus, MoreVertical, Mail, Phone, Clock, Calendar } from "lucide-react";

interface Membro {
  id: string;
  nome: string;
  cargo: string;
  status: string;
  email: string;
  telefone: string;
  horarios: string[];
  membroId: string;
  percentualComissao: number;
}

export default function EquipePage() {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [agendamentosHoje, setAgendamentosHoje] = useState<any[]>([]);
  const [modalAberto, setModalAberto] = useState(false);

  const [novoMembro, setNovoMembro] = useState<Omit<Membro, "id">>({
    nome: "",
    cargo: "",
    status: "Disponível",
    email: "",
    telefone: "",
    horarios: [],
    membroId: "",
    percentualComissao: 0,
  });

  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAgora(new Date());
    }, 60000); // atualiza a cada minuto

    return () => clearInterval(intervalo);
  }, []);

  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [membroSelecionado, setMembroSelecionado] = useState<Membro | null>(null);
  const [modalComissaoAberto, setModalComissaoAberto] = useState(false);
  const [modalDesempenhoAberto, setModalDesempenhoAberto] = useState(false);
  
  // 🕒 Novos estados para o Modal de Agenda/Horários do Membro
  const [modalHorariosAberto, setModalHorariosAberto] = useState(false);
  const [horariosOcupadosMembro, setHorariosOcupadosMembro] = useState<any[]>([]);
  const [dataConsultaAgenda, setDataConsultaAgenda] = useState(new Date().toISOString().split("T")[0]);

  // Novo estado temporário para gerenciar o valor da comissão no modal
  const [novaComissaoValor, setNovaComissaoValor] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "membros"), (snapshot) => {
      const lista: Membro[] = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        nome: docItem.data().nome || "",
        cargo: docItem.data().cargo || "",
        status: docItem.data().status || "Disponível",
        email: docItem.data().email || "",
        telefone: docItem.data().telefone || "",
        horarios: docItem.data().horarios || [],
        membroId: docItem.data().membroId || "",
        percentualComissao: docItem.data().percentualComissao || 0,
      }));
      setMembros(lista);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "agendamentos"),
      (snapshot) => {
        const hoje = new Date().toLocaleDateString("pt-BR");

        const lista = snapshot.docs
          .map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }))
          .filter((agendamento: any) => {
            if (!agendamento.data) return false;
            return (
              agendamento.data.toDate().toLocaleDateString("pt-BR") === hoje
            );
          });

        setAgendamentosHoje(lista);
      }
    );

    return () => unsubscribe();
  }, []);

  function obterStatusMembro(membro: Membro) {
    if (membro.status === "Ausente") return "Ausente";

    const horarioAtual = agora.getHours() * 60 + agora.getMinutes();

    const atendimentoAtivo = agendamentosHoje.find((agendamento: any) => {
      if (agendamento.membroId !== membro.id) return false;
      if (agendamento.status === "cancelado") return false;
      if (!agendamento.horario) return false;

      const [hora, minuto] = agendamento.horario.split(":").map(Number);
      const horarioInicio = hora * 60 + minuto;
      const duracao = parseInt(String(agendamento.duracao || "30 Min")) || 30;
      const horarioFim = horarioInicio + duracao;

      return horarioAtual >= horarioInicio && horarioAtual <= horarioFim;
    });

    return atendimentoAtivo ? "Em atendimento" : "Disponível";
  }

  function obterAtendimentoAtual(membro: Membro) {
    const horarioAtual = agora.getHours() * 60 + agora.getMinutes();

    return agendamentosHoje.find((agendamento: any) => {
      if (
        agendamento.membroId !== membro.id ||
        agendamento.status === "cancelado" ||
        !agendamento.horario
      ) {
        return false;
      }

      const [hora, minuto] = agendamento.horario.split(":").map(Number);
      const horarioInicio = hora * 60 + minuto;
      const duracao = parseInt(String(agendamento.duracao || "30 Min")) || 30;
      const horarioFim = horarioInicio + duracao;

      return horarioAtual >= horarioInicio && horarioAtual <= horarioFim;
    });
  }

  const handleExcluirMembro = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este membro da equipe?")) return;

    try {
      await deleteDoc(doc(db, "membros", id));
      setMembros((prev) => prev.filter((m) => m.id !== id));
      alert("Membro excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir membro:", error);
      alert("Ocorreu um erro ao excluir membro!");
    }
  };

  const handleSalvarComissao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membroSelecionado) return;

    try {
      const membroRef = doc(db, "membros", membroSelecionado.id);
      await updateDoc(membroRef, { percentualComissao: novaComissaoValor });

      setModalComissaoAberto(false);
      setMembroSelecionado(null);
      alert("Comissão atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar comissão:", error);
      alert("Erro ao atualizar comissão.");
    }
  };

  const [atendimentosConcluidos, setAtendimentosConcluidos] = useState<any[]>([]);
  const [carregandoDesempenho, setCarregandoDesempenho] = useState(false);

  async function salvarMembro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await addDoc(collection(db, "membros"), novoMembro);
      setModalAberto(false);
      setNovoMembro({
        nome: "",
        cargo: "",
        status: "Disponível",
        email: "",
        telefone: "",
        horarios: [],
        membroId: "",
        percentualComissao: 0,
      });
    } catch (error) {
      console.error("Erro ao salvar membro:", error);
    }
  }

  function abrirEmail(email: string) {
    if (email) window.open(`mailto:${email}`, "_blank");
  }

  function abrirWhatsApp(telefone: string) {
    if (telefone) {
      const numeroFormatado = telefone.replace(/\D/g, "");
      window.open(`https://wa.me/${numeroFormatado}`, "_blank");
    }
  }

  // 🕒 Função para carregar os agendamentos do dia selecionado para o modal de horários
  async function abrirAgendaHorarios(membro: Membro, dataStr: string) {
    setMembroSelecionado(membro);
    setDataConsultaAgenda(dataStr);
    setModalHorariosAberto(true);

    try {
      const snapshot = await getDocs(collection(db, "agendamentos"));
      const lista: any[] = [];

      snapshot.forEach((docItem) => {
        const dados = docItem.data();
        if (dados.membroId === membro.id && dados.status !== "cancelado" && dados.data && dados.horario) {
          const dataObj = dados.data.toDate ? dados.data.toDate() : new Date(dados.data);
          const ano = dataObj.getFullYear();
          const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
          const dia = String(dataObj.getDate()).padStart(2, "0");
          const dataFormatada = `${ano}-${mes}-${dia}`;

          if (dataFormatada === dataStr) {
            lista.push({ id: docItem.id, ...dados });
          }
        }
      });

      setHorariosOcupadosMembro(lista);
    } catch (error) {
      console.error("Erro ao carregar agenda do membro:", error);
      setHorariosOcupadosMembro([]);
    }
  }

  const handleExcluirAtendimentoHistorico = async (idAtendimento: string) => {
    if (!window.confirm("Deseja realmente remover este atendimento do histórico?")) return;

    try {
      await deleteDoc(doc(db, "agendamentos", idAtendimento));
      setAtendimentosConcluidos((prev) => prev.filter((item) => item.id !== idAtendimento));
      alert("Atendimento removido com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir atendimento:", error);
      alert("Erro ao remover atendimento.");
    }
  };

  const HORARIOS_PADRAO = [
    "08:00", "09:00", "10:00", "11:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Equipe</h1>
          <p className="text-slate-400">Gerenciamento de colaboradores e escalas</p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
        >
          <UserPlus size={20} />
          Adicionar Membro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {membros.map((membro) => (
          <div
            key={membro.id}
            className="relative bg-navy-900 border border-navy-800 p-6 rounded-xl hover:border-gold-500/50 transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-navy-800 rounded-full flex items-center justify-center text-gold-500 font-bold border border-navy-700">
                {membro.nome
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <button
                className="text-slate-500 hover:text-white"
                onClick={() =>
                  setMenuAberto(menuAberto === membro.id ? null : membro.id)
                }
              >
                <MoreVertical size={20} />
              </button>

              {menuAberto === membro.id && (
                <div className="absolute right-4 top-14 bg-navy-800 border border-navy-700 rounded-lg shadow-lg z-50 w-[180px]">
                  <button
                    onClick={() => {
                      setMembroSelecionado(membro);
                      setNovaComissaoValor(membro.percentualComissao || 0);
                      setModalComissaoAberto(true);
                      setMenuAberto(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-navy-700"
                  >
                    Editar Comissão
                  </button>

                  <button
                    onClick={async () => {
                      setMembroSelecionado(membro);
                      setModalDesempenhoAberto(true);
                      setMenuAberto(null);
                      
                      setCarregandoDesempenho(true);
                      try {
                        const agoraData = new Date();
                        const primeiroDia = new Date(agoraData.getFullYear(), agoraData.getMonth(), 1);
                        const ultimoDia = new Date(agoraData.getFullYear(), agoraData.getMonth() + 1, 0, 23, 59, 59);

                        const q = query(
                          collection(db, "agendamentos"),
                          where("membroId", "==", membro.id),
                          where("status", "==", "concluido"),
                          where("data", ">=", primeiroDia),
                          where("data", "<=", ultimoDia)
                        );

                        const querySnapshot = await getDocs(q);
                        const listaConcluidos = querySnapshot.docs.map((d) => ({
                          id: d.id,
                          ...d.data(),
                        }));
                        setAtendimentosConcluidos(listaConcluidos);
                      } catch (err) {
                        console.error("Erro ao buscar desempenho do mês:", err);
                        setAtendimentosConcluidos([]);
                      } finally {
                        setCarregandoDesempenho(false);
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-navy-700"
                  >
                    Ver Desempenho
                  </button>

                  <button
                    onClick={() => {
                      handleExcluirMembro(membro.id);
                      setMenuAberto(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-navy-700"
                  >
                    Excluir Membro
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold text-white">{membro.nome}</h3>
              <p className="text-sm text-slate-400">{membro.cargo}</p>
              <p className="text-xs text-gold-500 mt-1">Comissão: {membro.percentualComissao}%</p>
            </div>

            {obterAtendimentoAtual(membro) && (
              <div className="mt-3 text-sm bg-navy-800/40 p-2 rounded border border-navy-700">
                <p className="text-gold-500 font-semibold text-xs">Cliente Atual</p>
                <p className="text-white font-medium">{obterAtendimentoAtual(membro)?.cliente}</p>
                <p className="text-slate-400 text-xs">{obterAtendimentoAtual(membro)?.servico} • {obterAtendimentoAtual(membro)?.horario}</p>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <span
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  obterStatusMembro(membro) === "Disponível"
                    ? "bg-green-900/30 text-green-400"
                    : obterStatusMembro(membro) === "Em atendimento"
                    ? "bg-orange-900/30 text-orange-400"
                    : "bg-red-900/30 text-red-400"
                }`}
              >
                {obterStatusMembro(membro)}
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-navy-800 flex justify-between text-slate-500">
              <span title="Enviar E-mail" className="inline-flex">
                <Mail size={18} className="hover:text-gold-500 cursor-pointer transition" onClick={() => abrirEmail(membro.email)} />
              </span>
              <span title="Abrir WhatsApp" className="inline-flex">
                <Phone size={18} className="hover:text-gold-500 cursor-pointer transition" onClick={() => abrirWhatsApp(membro.telefone)} />
              </span>
              <span title="Ver Escala e Agenda" className="inline-flex">
                <Clock size={18} className="hover:text-gold-500 cursor-pointer transition" onClick={() => abrirAgendaHorarios(membro, new Date().toISOString().split("T")[0])} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 🕒 MODAL DE AGENDA E HORÁRIOS DO PROFISSIONAL */}
      {modalHorariosAberto && membroSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl w-full max-w-md relative shadow-2xl">
            <button
              onClick={() => setModalHorariosAberto(false)}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Clock className="text-gold-500" size={20} /> Agenda do Profissional
            </h2>
            <p className="text-sm text-slate-400 mb-4">{membroSelecionado.nome} — {membroSelecionado.cargo}</p>

            {/* Seletor de Data para consultar a agenda */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 block mb-1">Selecione o Dia para Consultar</label>
              <input
                type="date"
                value={dataConsultaAgenda}
                onChange={(e) => abrirAgendaHorarios(membroSelecionado, e.target.value)}
                className="w-full p-2.5 rounded-lg bg-navy-800 border border-navy-700 text-white text-sm outline-none focus:border-gold-500"
              />
            </div>

            {/* Grade de Horários com Status Livre / Ocupado */}
            <div className="space-y-2 mb-4">
              <label className="text-xs text-slate-400 block">Horários do Expediente</label>
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                {HORARIOS_PADRAO.map((hora) => {
                  const agendamentoEncontrado = horariosOcupadosMembro.find((a) => a.horario === hora);
                  const isOcupado = !!agendamentoEncontrado;

                  return (
                    <div
                      key={hora}
                      className={`p-2.5 rounded-lg text-xs border text-center font-mono transition flex flex-col justify-between ${
                        isOcupado
                          ? "bg-red-950/40 border-red-900/50 text-red-300"
                          : "bg-navy-800 border-navy-700 text-green-400"
                      }`}
                    >
                      <span className="font-bold">{hora}</span>
                      <span className="text-[10px] mt-1 truncate">
                        {isOcupado ? agendamentoEncontrado.cliente : "Disponível"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setModalHorariosAberto(false)}
              className="w-full py-2.5 bg-navy-800 hover:bg-navy-700 text-white font-semibold rounded-lg text-sm transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal Adicionar Membro */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-navy-900 p-6 rounded-lg w-full max-w-md relative">
            <button
              onClick={() => setModalAberto(false)}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-white">Adicionar Membro</h2>
            <form onSubmit={salvarMembro} className="space-y-4">
              <input
                type="text"
                placeholder="Nome"
                value={novoMembro.nome}
                onChange={(e) => setNovoMembro({ ...novoMembro, nome: e.target.value })}
                required
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white text-sm"
              />
              <input
                type="text"
                placeholder="Cargo"
                value={novoMembro.cargo}
                onChange={(e) => setNovoMembro({ ...novoMembro, cargo: e.target.value })}
                required
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={novoMembro.email}
                onChange={(e) => setNovoMembro({ ...novoMembro, email: e.target.value })}
                required
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white text-sm"
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={novoMembro.telefone}
                onChange={(e) => setNovoMembro({ ...novoMembro, telefone: e.target.value })}
                required
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white text-sm"
              />
              <select
                value={novoMembro.status}
                onChange={(e) => setNovoMembro({ ...novoMembro, status: e.target.value })}
                required
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white text-sm"
              >
                <option>Disponível</option>
                <option>Em atendimento</option>
                <option>Ausente</option>
              </select>
              <input
                type="number"
                placeholder="% Comissão"
                value={novoMembro.percentualComissao}
                onChange={(e) => setNovoMembro({ ...novoMembro, percentualComissao: Number(e.target.value) })}
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white text-sm"
              />
              <button type="submit" className="bg-gold-500 w-full py-2 rounded font-semibold text-navy-900 hover:bg-gold-600 transition">
                Salvar Membro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Comissão */}
      {modalComissaoAberto && membroSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-navy-900 p-6 rounded-lg w-full max-w-md relative">
            <button
              onClick={() => setModalComissaoAberto(false)}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-2 text-white">Editar Comissão</h2>
            <p className="text-sm text-slate-400 mb-4">Membro: {membroSelecionado.nome}</p>
            <form onSubmit={handleSalvarComissao} className="space-y-4">
              <input
                type="number"
                placeholder="Novo % de Comissão"
                value={novaComissaoValor}
                onChange={(e) => setNovaComissaoValor(Number(e.target.value))}
                required
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white text-sm"
              />
              <button type="submit" className="bg-gold-500 w-full py-2 rounded font-semibold text-navy-900 hover:bg-gold-600 transition">
                Salvar Alteração
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Desempenho */}
      {modalDesempenhoAberto && membroSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 p-6 rounded-lg w-full max-w-lg relative max-h-[90vh] flex flex-col shadow-2xl">
            <button
              onClick={() => setModalDesempenhoAberto(false)}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-1 text-white">Desempenho do Colaborador</h2>
            <p className="text-sm text-slate-400 mb-4">{membroSelecionado.nome} ({membroSelecionado.cargo})</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-navy-800 p-3 rounded-lg border border-navy-700">
                <p className="text-xs text-slate-400">Comissão Atual</p>
                <p className="text-lg font-bold text-gold-500">{membroSelecionado.percentualComissao}%</p>
              </div>
              <div className="bg-navy-800 p-3 rounded-lg border border-navy-700">
                <p className="text-xs text-slate-400">Atendimentos Concluídos</p>
                <p className="text-lg font-bold text-green-400">{atendimentosConcluidos.length}</p>
              </div>
            </div>

            {(() => {
              const valorTotalAtendimentos = atendimentosConcluidos.reduce((acc, curr) => {
                return acc + (Number(curr.valor) || Number(curr.preco) || 0);
              }, 0);

              const percentual = membroSelecionado.percentualComissao || 0;
              const totalComissao = (valorTotalAtendimentos * percentual) / 100;

              return (
                <div className="bg-navy-800/80 border border-gold-500/30 p-4 rounded-lg mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Faturamento dos Concluídos:</span>
                    <span className="text-white font-semibold">
                      {valorTotalAtendimentos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-base border-t border-navy-700 pt-2">
                    <span className="text-gold-400 font-medium">Comissão a Receber ({percentual}%):</span>
                    <span className="text-gold-400 font-bold">
                      {totalComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              );
            })()}

            <h3 className="text-sm font-semibold text-white mb-2">Histórico de Concluídos</h3>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-60">
              {carregandoDesempenho ? (
                <p className="text-sm text-slate-400 text-center py-4">Buscando dados no Firestore...</p>
              ) : atendimentosConcluidos.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Nenhum atendimento concluído encontrado.</p>
              ) : (
                atendimentosConcluidos.map((atendimento: any) => (
                  <div key={atendimento.id} className="bg-navy-800/60 border border-navy-700/60 p-3 rounded text-sm flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{atendimento.cliente || "Cliente não informado"}</p>
                      <p className="text-xs text-slate-400">{atendimento.servico || "Serviço"} • {atendimento.horario || "--:--"}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded font-semibold uppercase">
                        Concluído
                      </span>
                      
                      <button
                        onClick={() => handleExcluirAtendimentoHistorico(atendimento.id)}
                        className="text-slate-400 hover:text-red-400 p-1 transition"
                        title="Remover atendimento"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setModalDesempenhoAberto(false)}
              className="mt-4 bg-navy-700 hover:bg-navy-600 text-white w-full py-2 rounded font-semibold transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}