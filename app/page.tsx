"use client";

import { useEffect, useState } from "react";
import { collection, query, where, Timestamp, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface Agendamento {
  id: string;
  cliente: string;
  servico: string;
  data: Timestamp | string;
  horario: string;
  valor: number;
  status: string;
}

interface AgendamentosData {
  agendamentosHoje: number;
  faturamentoDiario: number;
  taxaOcupacao: number;
  feedbackMedio: number;
  listaAgendamentos: Agendamento[];
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<AgendamentosData | null>(null);
  const [error, setError] = useState<string | null>(null);

  function formatarData(data: Timestamp | string) {
    if (!data) return "";
    if (typeof data === "string") return data;
    return data.toDate().toLocaleDateString("pt-BR");
  }

  function formatarValor(valor: number) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  useEffect(() => {
    setLoading(true);
    setError(null);

    const hojeInicio = new Date();
    hojeInicio.setHours(0, 0, 0, 0);
    const hojeFim = new Date();
    hojeFim.setHours(23, 59, 59, 999);

    // Consulta slots e avaliações ficam via getDocs pois mudam menos e não precisam de listener
    async function fetchSlotsETaxaFeedback() {
      try {
        // Fetch slots para taxa ocupação
        const slotsRef = collection(db, "slots");
        const qSlots = query(
          slotsRef,
          where("data", ">=", Timestamp.fromDate(hojeInicio)),
          where("data", "<=", Timestamp.fromDate(hojeFim))
        );
        const snapshotSlots = await getDocs(qSlots);

        const totalSlots = snapshotSlots.size;
        let ocupados = 0;
        snapshotSlots.forEach((doc) => {
          const data = doc.data();
          if (data.ocupado) ocupados++;
        });
        const taxaOcupacao = totalSlots > 0 ? Math.round((ocupados / totalSlots) * 100) : 0;

        // Fetch avaliações para feedback médio
        const avaliacoesRef = collection(db, "avaliacoes");
        const snapshotAvaliacoes = await getDocs(avaliacoesRef);

        let somaNotas = 0;
        let totalAvaliacoes = 0;
        snapshotAvaliacoes.forEach((doc) => {
          const data = doc.data();
          if (typeof data.nota === "number") {
            somaNotas += data.nota;
            totalAvaliacoes++;
          }
        });
        const feedbackMedio = totalAvaliacoes > 0 ? parseFloat((somaNotas / totalAvaliacoes).toFixed(1)) : 5.0;

        return { taxaOcupacao, feedbackMedio };
      } catch (error) {
        setError("Erro ao carregar dados auxiliares.");
        return { taxaOcupacao: 0, feedbackMedio: 5.0 };
      }
    }

    const agendamentosRef = collection(db, "agendamentos");
    const qAgendamentos = query(
      agendamentosRef,
      where("data", ">=", Timestamp.fromDate(hojeInicio)),
      where("data", "<=", Timestamp.fromDate(hojeFim))
    );

    // Abre listener em tempo real para agendamentos do dia
    const unsubscribe = onSnapshot(
      qAgendamentos,
      async (snapshotAgendamentos) => {
        try {
          const listaAgendamentos: Agendamento[] = snapshotAgendamentos.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              cliente: data.cliente || "",
              servico: data.servico || "",
              data: data.data || "",
              horario: data.horario || "",
              valor:
                typeof data.valor === "number"
                  ? data.valor
                  : parseFloat(
                      (data.valor || "")
                        .toString()
                        .replace(/[^\d.,]/g, "")
                        .replace(",", ".")
                    ) || 0,
              status: data.status || "pendente",
            };
          });

          const agendamentosHoje = listaAgendamentos.length;
          const faturamentoDiario = listaAgendamentos.reduce((sum, ag) => sum + ag.valor, 0);

          const { taxaOcupacao, feedbackMedio } = await fetchSlotsETaxaFeedback();

          setDados({
            agendamentosHoje,
            faturamentoDiario,
            taxaOcupacao,
            feedbackMedio,
            listaAgendamentos,
          });
          setLoading(false);
        } catch (error) {
          setError("Erro ao processar dados do dashboard.");
          setLoading(false);
        }
      },
      (error) => {
        setError("Erro ao escutar dados do Firestore.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-8 text-white">Carregando dados do dashboard...</div>;
  if (error) return <div className="p-8 text-red-500 font-bold">{error}</div>;
  if (!dados) return <div className="p-8 text-white">Nenhum dado disponível no momento.</div>;

  const kpis = [
    { title: "Agendamentos Hoje", value: dados.agendamentosHoje },
    { title: "Faturamento Diário", value: formatarValor(dados.faturamentoDiario) },
    { title: "Taxa de Ocupação", value: `${dados.taxaOcupacao}%` },
    { title: "Feedback Médio", value: dados.feedbackMedio },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-400 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="bg-navy-900 border border-navy-800 p-6 rounded-xl hover:border-gold-500 transition-colors"
          >
            <h3 className="text-slate-400 text-sm">{kpi.title}</h3>
            <p className="text-2xl font-bold text-gray-400 mt-2">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 text-white max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Agendamentos do Dia</h2>
        <ol className="list-decimal list-inside space-y-2">
          {dados.listaAgendamentos.map((agendamento) => (
            <li key={agendamento.id} className="hover:bg-navy-800 p-2 rounded">
              <strong>{agendamento.cliente}</strong> - {agendamento.servico} - {formatarData(agendamento.data)} - {agendamento.horario} - {formatarValor(agendamento.valor)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
