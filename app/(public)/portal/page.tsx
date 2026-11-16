"use client";

import { useState, useEffect } from "react";
import { db } from "../../../firebaseConfig";
import { collection, getDocs, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { Calendar, Clock, User, Scissors, CheckCircle2, Phone } from "lucide-react";

export default function PortalAgendamentoPage() {
  const [etapa, setEtapa] = useState(1); // 1: Dados, 2: Serviço/Profissional, 3: Data/Hora, 4: Sucesso
  
  // Listas vindas do Firebase
  const [servicos, setServicos] = useState<any[]>([]);
  const [membros, setMembros] = useState<any[]>([]);
  
  // Dados do formulário do cliente
  const [cliente, setCliente] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [servicoSelecionado, setServicoSelecionado] = useState<any>(null);
  const [membroSelecionado, setMembroSelecionado] = useState<any>(null);
  const [dataEscolhida, setDataEscolhida] = useState("");
  const [horarioEscolhido, setHorarioEscolhido] = useState("");
  
  const [loading, setLoading] = useState(false);

  // Horários disponíveis na barbearia
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

  // Função para finalizar o agendamento enviado pelo cliente
  async function confirmarAgendamento(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const [ano, mes, dia] = dataEscolhida.split("-").map(Number);
      const dataTimestamp = Timestamp.fromDate(new Date(ano, mes - 1, dia, 12, 0, 0));

      await addDoc(collection(db, "agendamentos"), {
        cliente,
        whatsapp,
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

      setLoading(false);
      setEtapa(4); // Vai para a tela de sucesso
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
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
                className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white focus:ring-2 focus:ring-gold-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">WhatsApp (com DDD)</label>
              <input
                type="text"
                required
                placeholder="Ex: (11) 99999-9999"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white focus:ring-2 focus:ring-gold-500 outline-none"
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
                className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white outline-none"
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
                className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white outline-none"
                defaultValue=""
              >
                <option  value="" disabled>Selecione um profissional...</option>
                {membros.map(m => (
                  <option className="text-black" key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEtapa(1)}
                className="w-1/3 py-3 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded-lg font-medium"
              >
                Voltar
              </button>
              <button
                disabled={!servicoSelecionado || !membroSelecionado}
                onClick={() => setEtapa(3)}
                className="w-2/3 py-3 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold rounded-lg transition disabled:opacity-50"
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
                onChange={(e) => setDataEscolhida(e.target.value)}
                className="w-full mt-1 p-3 rounded-lg bg-navy-800 border border-navy-700 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Horários Disponíveis</label>
              <div className="grid grid-cols-3 gap-2">
                {HORARIOS_DISPONIVEIS.map((hora) => (
                  <button
                    type="button"
                    key={hora}
                    onClick={() => setHorarioEscolhido(hora)}
                    className={`p-2 rounded-lg text-sm border font-mono transition ${
                      horarioEscolhido === hora 
                        ? "bg-gold-500 text-navy-900 border-gold-500 font-bold" 
                        : "bg-navy-800 border-navy-700 text-slate-300 hover:border-gold-500/50"
                    }`}
                  >
                    {hora}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEtapa(2)}
                className="w-1/3 py-3 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded-lg font-medium"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading || !dataEscolhida || !horarioEscolhido}
                className="w-2/3 py-3 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold rounded-lg transition disabled:opacity-50"
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
              Tudo pronto, <span className="text-gold-400 font-semibold">{cliente}</span>! Seu horário foi registrado com sucesso e já está visível na agenda da barbearia.
            </p>
            <button
              onClick={() => {
                setEtapa(1);
                setCliente("");
                setWhatsapp("");
                setServicoSelecionado(null);
                setMembroSelecionado(null);
                setDataEscolhida("");
                setHorarioEscolhido("");
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