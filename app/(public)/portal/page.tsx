"use client";

import { useState, useEffect } from "react";
import { db } from "../../../firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, Timestamp, query, where } from "firebase/firestore";
import { Calendar, Clock, User, Scissors, CheckCircle2, Phone, Mail } from "lucide-react";

export default function PortalAgendamentoPage() {
  const [etapa, setEtapa] = useState(1); // 1: Dados, 2: Serviço/Profissional, 3: Data/Hora, 4: Sucesso
  
  // Listas vindas do Firebase
  const [servicos, setServicos] = useState<any[]>([]);
  const [membros, setMembros] = useState<any[]>([]);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  
  // Dados do formulário do cliente
  const [cliente, setCliente] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState(""); // 📧 Novo estado para o e-mail
  const [servicoSelecionado, setServicoSelecionado] = useState<any>(null);
  const [membroSelecionado, setMembroSelecionado] = useState<any>(null);
  const [dataEscolhida, setDataEscolhida] = useState("");
  const [horarioEscolhido, setHorarioEscolhido] = useState("");
  
  const [loading, setLoading] = useState(false);

  // Horários padrão da barbearia
  const HORARIOS_DISPONIVEIS = [
    "08:00", "09:00", "10:00", "11:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  // Carregar serviços e membros do Firestore ao abrir a página
  useEffect(() => {
    async function carregarDados() {
      try {
        const servicosSnap = await getDocs(collection(db, "servicos"));
        setServicos(servicosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const membrosSnap = await getDocs(collection(db, "membros"));
        setMembros(membrosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Erro ao carregar dados para agendamento:", error);
      }
    }
    carregarDados();
  }, []);

  // Buscar horários ocupados filtrando por membroId
  useEffect(() => {
    async function verificarHorariosOcupados() {
      if (!membroSelecionado || !dataEscolhida) {
        setHorariosOcupados([]);
        return;
      }

      try {
        const q = query(
          collection(db, "agendamentos"),
          where("membroId", "==", membroSelecionado.id)
        );

        const snapshot = await getDocs(q);
        const ocupados: string[] = [];

        snapshot.forEach((docItem) => {
          const dados = docItem.data();
          if (dados.status !== "cancelado" && dados.data && dados.horario) {
            const dataObj = dados.data.toDate ? dados.data.toDate() : new Date(dados.data);
            const ano = dataObj.getFullYear();
            const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
            const dia = String(dataObj.getDate()).padStart(2, "0");
            const dataFormatada = `${ano}-${mes}-${dia}`;

            if (dataFormatada === dataEscolhida) {
              ocupados.push(dados.horario);
            }
          }
        });

        setHorariosOcupados(ocupados);
      } catch (error) {
        console.error("Erro ao buscar horários ocupados:", error);
      }
    }

    verificarHorariosOcupados();
  }, [membroSelecionado, dataEscolhida]);

  // Função para finalizar o agendamento e sincronizar com a coleção "clientes"
  async function confirmarAgendamento(e: React.FormEvent) {
    e.preventDefault();
    if (!horarioEscolhido || !dataEscolhida || !membroSelecionado) return;
    
    setLoading(true);

    try {
      const [ano, mes, dia] = dataEscolhida.split("-").map(Number);
      const dataTimestamp = Timestamp.fromDate(new Date(ano, mes - 1, dia, 12, 0, 0));
      const dataFormatadaStr = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;

      // Dupla checagem rápida no cliente antes de salvar
      if (horariosOcupados.includes(horarioEscolhido)) {
        alert("Este horário acabou de ser reservado! Por favor, escolha outro.");
        setLoading(false);
        setHorarioEscolhido("");
        return;
      }

      // 1. Salvar na coleção "agendamentos"
      await addDoc(collection(db, "agendamentos"), {
        cliente,
        whatsapp,
        email,
        servico: servicoSelecionado.nome,
        duracao: servicoSelecionado.duracao || "30 min",
        membro: membroSelecionado.nome,
        membroId: membroSelecionado.id,
        data: dataTimestamp,
        horario: horarioEscolhido,
        valor: Number(servicoSelecionado.preco || 0),
        status: "pendente",
        criadoEm: serverTimestamp(),
      });

      // 2. Sincronizar / Salvar na coleção "clientes" (Evita duplicados por WhatsApp/E-mail)
      const clientesRef = collection(db, "clientes");
      const qCliente = query(clientesRef, where("whatsapp", "==", whatsapp));
      const clienteSnapshot = await getDocs(qCliente);

      const novoServicoHistorico = {
        servico: servicoSelecionado.nome,
        data: dataFormatadaStr,
        valor: Number(servicoSelecionado.preco || 0),
      };

      if (!clienteSnapshot.empty) {
        // Se o cliente já existe, atualiza os dados e insere no histórico
        const clienteDoc = clienteSnapshot.docs[0];
        const dadosExistentes = clienteDoc.data();
        const historicoAtual = dadosExistentes.historicoServicos || [];

        await updateDoc(doc(db, "clientes", clienteDoc.id), {
          nome: cliente,
          email: email || dadosExistentes.email,
          historicoServicos: [...historicoAtual, novoServicoHistorico],
        });
      } else {
        // Se for novo cliente, cria o documento na coleção "clientes"
        await addDoc(clientesRef, {
          nome: cliente,
          whatsapp,
          email,
          historicoServicos: [novoServicoHistorico],
          criadoEm: serverTimestamp(),
        });
      }

      setLoading(false);
      setEtapa(4); // Vai para a tela de sucesso
    } catch (error) {
      console.error("Erro ao salvar agendamento e cliente:", error);
      alert("Erro ao concluir agendamento. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-2xl">
        
        {/* Cabeçalho */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gold-500">TECH LION</h1>
          <p className="text-slate-400 text-sm">Agende seu horário online</p>
        </div>

        {/* ETAPA 1: Dados Pessoais */}
        {etapa === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setEtapa(2); }} className="space-y-4">
            <h2 className="text-lg font-semibold text-gold-400 flex items-center gap-2">
              <User size={18} /> Seus Dados
            </h2>
            <div>
              <label className="text-xs text-slate-400">Nome Completo</label>
              <input
                type="text"
                required
                placeholder="Ex: João Silva"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white focus:ring-2 focus:ring-gold-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">WhatsApp (com DDD)</label>
              <input
                type="text"
                required
                placeholder="Ex: 11999999999"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white focus:ring-2 focus:ring-gold-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">E-mail</label>
              <input
                type="email"
                required
                placeholder="Ex: joao@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white focus:ring-2 focus:ring-gold-500 outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 mt-4 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold rounded-lg transition"
            >
              Continuar
            </button>
          </form>
        )}

        {/* ETAPA 2: Escolha de Serviço e Profissional */}
        {etapa === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gold-400 flex items-center gap-2">
              <Scissors size={18} /> Escolha o Serviço & Profissional
            </h2>
            
            <div>
              <label className="text-xs text-slate-400">Serviço Desejado</label>
              <select
                onChange={(e) => setServicoSelecionado(servicos.find(s => s.id === e.target.value))}
                className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white outline-none text-sm"
                defaultValue=""
              >
                <option value="" disabled>Selecione um serviço...</option>
                {servicos.map(s => (
                  <option className="text-black" key={s.id} value={s.id}>
                    {s.nome} - R$ {s.preco} ({s.duracao})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400">Profissional (Barbeiro)</label>
              <select
                onChange={(e) => setMembroSelecionado(membros.find(m => m.id === e.target.value))}
                className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white outline-none text-sm"
                defaultValue=""
              >
                <option value="" disabled>Selecione um profissional...</option>
                {membros.map(m => (
                  <option className="text-black" key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEtapa(1)}
                className="w-1/3 py-3 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded-lg font-medium text-sm"
              >
                Voltar
              </button>
              <button
                disabled={!servicoSelecionado || !membroSelecionado}
                onClick={() => setEtapa(3)}
                className="w-2/3 py-3 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold rounded-lg transition disabled:opacity-50 text-sm"
              >
                Escolher Data
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 3: Data e Horário */}
        {etapa === 3 && (
          <form onSubmit={confirmarAgendamento} className="space-y-4">
            <h2 className="text-lg font-semibold text-gold-400 flex items-center gap-2">
              <Calendar size={18} /> Data & Horário
            </h2>

            <div>
              <label className="text-xs text-slate-400">Data do Atendimento</label>
              <input
                type="date"
                required
                value={dataEscolhida}
                onChange={(e) => {
                  setDataEscolhida(e.target.value);
                  setHorarioEscolhido("");
                }}
                className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Horários Disponíveis {membroSelecionado && <span className="text-gold-400">para {membroSelecionado.nome}</span>}
              </label>
              
              {!dataEscolhida ? (
                <p className="text-xs text-slate-500 italic py-2">Selecione uma data primeiro para ver os horários livres.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {HORARIOS_DISPONIVEIS.map((hora) => {
                    const ocupado = horariosOcupados.includes(hora);

                    return (
                      <button
                        type="button"
                        key={hora}
                        disabled={ocupado}
                        onClick={() => setHorarioEscolhido(hora)}
                        className={`p-2 rounded-lg text-sm border font-mono transition ${
                          ocupado 
                            ? "bg-red-950/40 border-red-900/50 text-red-400/50 line-through cursor-not-allowed" 
                            : horarioEscolhido === hora 
                              ? "bg-gold-500 text-navy-900 border-gold-500 font-bold" 
                              : "bg-navy-800 border-navy-700 text-slate-300 hover:border-gold-500/50"
                        }`}
                      >
                        {hora} {ocupado && "(Ocupado)"}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEtapa(2)}
                className="w-1/3 py-3 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded-lg font-medium text-sm"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading || !dataEscolhida || !horarioEscolhido}
                className="w-2/3 py-3 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold rounded-lg transition disabled:opacity-50 text-sm"
              >
                {loading ? "Agendando..." : "Confirmar Agendamento"}
              </button>
            </div>
          </form>
        )}

        {/* ETAPA 4: Sucesso */}
        {etapa === 4 && (
          <div className="text-center space-y-4 py-6">
            <CheckCircle2 size={56} className="text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">Agendamento Realizado!</h2>
            <p className="text-slate-400 text-sm">
              Tudo pronto, <span className="text-gold-400 font-semibold">{cliente}</span>! Seu horário foi registrado com sucesso e o seu cadastro foi atualizado na nossa base.
            </p>
            <button
              onClick={() => {
                setEtapa(1);
                setCliente("");
                setWhatsapp("");
                setEmail("");
                setServicoSelecionado(null);
                setMembroSelecionado(null);
                setDataEscolhida("");
                setHorarioEscolhido("");
                setHorariosOcupados([]);
              }}
              className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold rounded-lg transition"
            >
              Fazer Novo Agendamento
            </button>
          </div>
        )}

      </div>
    </div>
  );
}