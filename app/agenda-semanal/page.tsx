"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Calendar as CalendarIcon, Clock, User, Scissors } from "lucide-react";

interface Agendamento {
  id: string;
  cliente: string;
  servico: string;
  horario: string; // Ex: "11:00"
  data: any;       // Timestamp do Firestore
  status: string;  // "pendente", "concluido", etc.
}

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
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

  // Função auxiliar para mapear o Timestamp do Firestore para o dia da semana correspondente
  // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  function obterDiaSemanaIndex(timestampData: any): number {
    if (!timestampData) return -1;
    const dataObj = timestampData.toDate ? timestampData.toDate() : new Date(timestampData);
    const diaJS = dataObj.getDay(); // 0(Dom) a 6(Sáb)
    // Se quiser ignorar domingo ou ajustar para a nossa lista (Segunda a Sábado):
    // Vamos converter: Segunda(1)->0, Terça(2)->1, ..., Sábado(6)->5
    if (diaJS === 0) return -1; // Domingo fora da grade principal, se desejar
    return diaJS - 1; 
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
                      // Filtra os agendamentos que batem com este dia da semana e este horário (ex: "11:00")
                      const agendamentosNoBloco = agendamentos.filter((item) => {
                        if (item.status === "cancelado") return false;
                        const diaDoItem = obterDiaSemanaIndex(item.data);
                        const horaDoItem = item.horario ? String(item.horario).substring(0, 5) : "";                        return diaDoItem === diaIndex && horaDoItem === hora;
                      });

                      return (
                        <td key={diaIndex} className="p-2 border-r border-navy-800 last:border-r-0 align-top min-h-[80px] h-20 w-44">
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