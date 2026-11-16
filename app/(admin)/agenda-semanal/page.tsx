"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { Calendar as CalendarIcon, Clock, User, Scissors, CalendarDays } from "lucide-react";

interface Agendamento {
  id: string;
  cliente: string;
  servico: string;
  horario: string; // Ex: "11:00"
  data: any;       // Timestamp do Firestore ou string "YYYY-MM-DD"
  status: string;  // "pendente", "concluido", etc.
}

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const HORARIOS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", 
  "18:00", "19:00", "20:00"
];

export default function AgendaSemanalPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Buscar agendamentos em tempo real do Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "agendamentos"), (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Agendamento[];
      
      setAgendamentos(lista);
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  // Função auxiliar corrigida para extrair o índice do dia da semana (0=Dom, 1=Seg, etc.) sem erro de fuso
  function obterDiaSemanaIndex(timestampData: any): number {
    if (!timestampData) return 0;
    
    // Se for string "YYYY-MM-DD"
    if (typeof timestampData === "string" && /^\d{4}-\d{2}-\d{2}$/.test(timestampData)) {
      const [ano, mes, dia] = timestampData.split("-").map(Number);
      const dataLocal = new Date(ano, mes - 1, dia);
      return dataLocal.getDay();
    }

    // Se for Timestamp do Firestore ou objeto Date
    const dataObj = timestampData.toDate ? timestampData.toDate() : new Date(timestampData);
    return isNaN(dataObj.getTime()) ? 0 : dataObj.getDay(); 
  }

  // Função para formatar a data curta para exibir no card (ex: "17/11")
  function formatarDataCard(timestampData: any): string {
    if (!timestampData) return "";

    if (typeof timestampData === "string" && /^\d{4}-\d{2}-\d{2}$/.test(timestampData)) {
      const [ano, mes, dia] = timestampData.split("-").map(Number);
      const dataLocal = new Date(ano, mes - 1, dia);
      return dataLocal.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    }

    const dataObj = timestampData.toDate ? timestampData.toDate() : new Date(timestampData);
    return isNaN(dataObj.getTime()) ? "" : dataObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="text-gold-500" size={28} />
            Agenda Semanal
          </h1>
          <p className="text-slate-400">Visão geral dos agendamentos distribuídos por horário e dia da semana.</p>
        </div>
      </div>

      {/* Grid da Agenda */}
      <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-xl">
        {carregando ? (
          <div className="p-12 text-center text-slate-400">Carregando grade de horários...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-navy-800 border-b border-navy-700 text-slate-300 text-xs uppercase tracking-wider">
                  <th className="p-3 text-center border-r border-navy-700 w-24">
                    <span className="flex items-center justify-center gap-1">
                      <Clock size={14} /> Hora
                    </span>
                  </th>
                  {DIAS_SEMANA.map((dia, index) => (
                    <th key={index} className="p-3 text-center border-r border-navy-700 last:border-r-0 font-semibold text-gold-400">
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800 text-sm">
                {HORARIOS.map((hora) => (
                  <tr key={hora} className="hover:bg-navy-800/40 transition-colors">
                    {/* Coluna de Horário */}
                    <td className="p-3 text-center font-mono text-slate-400 bg-navy-900/80 border-r border-navy-800 font-semibold text-xs">
                      {hora}
                    </td>

                    {/* Células dos Dias da Semana */}
                    {DIAS_SEMANA.map((_, diaIndex) => {
                      const agendamentosNoBloco = agendamentos.filter((item) => {
                        if (item.status === "cancelado") return false;
                        const diaDoItem = obterDiaSemanaIndex(item.data);
                        const horaDoItem = item.horario ? String(item.horario).substring(0, 5) : "";                        
                        return diaDoItem === diaIndex && horaDoItem === hora;
                      });

                      return (
                        <td key={diaIndex} className="p-2 border-r border-navy-800 last:border-r-0 align-top h-24 w-44">
                          <div className="space-y-1.5 h-full">
                            {agendamentosNoBloco.map((ag) => (
                              <div
                                key={ag.id}
                                className={`p-2 rounded-lg border text-xs shadow-sm transition-all ${
                                  ag.status === "concluido"
                                    ? "bg-green-950/40 border-green-700/60 text-green-200"
                                    : "bg-navy-800 border-gold-500/40 text-white hover:border-gold-500"
                                }`}
                              >
                                <div className="font-semibold flex items-center gap-1 text-gold-400 truncate">
                                  <User size={12} /> {ag.cliente || "Cliente"}
                                </div>
                                <div className="text-slate-300 flex items-center gap-1 truncate mt-0.5">
                                  <Scissors size={10} /> {ag.servico || "Serviço"}
                                </div>
                                {/* Exibição da data exata no card */}
                                <div className="text-slate-400 flex items-center gap-1 truncate mt-1 pt-1 border-t border-navy-700/50 text-[10px]">
                                  <CalendarDays size={10} className="text-gold-500" /> {formatarDataCard(ag.data)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}