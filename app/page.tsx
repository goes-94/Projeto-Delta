"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface DashboardData {
  agendamentosHoje: number;
  faturamentoDiario: number;
  taxaOcupacao: number;
  feedbackMedio: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);

      try {
        const hoje = new Date().toISOString().slice(0, 10); // formato yyyy-mm-dd

        // 1. Agendamentos Hoje
        const agendamentosRef = collection(db, "agendamentos");
        const qAgendamentos = query(agendamentosRef, where("data", "==", hoje));
        const snapshotAgendamentos = await getDocs(qAgendamentos);
        const agendamentosHoje = snapshotAgendamentos.size;

        // 2. Faturamento Diário (supondo coleção pagamentos com campo 'data' e 'valor')
        const pagamentosRef = collection(db, "pagamentos");
        const qPagamentos = query(pagamentosRef, where("data", "==", hoje));
        const snapshotPagamentos = await getDocs(qPagamentos);
        let faturamentoDiario = 0;
        snapshotPagamentos.forEach(doc => {
          const data = doc.data();
          faturamentoDiario += data.valor || 0;
        });

        // 3. Taxa de Ocupação (exemplo: contar slots ocupados / slots totais)
        // Suponha coleção "slots" com campo data e "ocupado" boolean
        const slotsRef = collection(db, "slots");
        const qSlotsHoje = query(slotsRef, where("data", "==", hoje));
        const snapshotSlots = await getDocs(qSlotsHoje);
        const totalSlots = snapshotSlots.size;
        let ocupados = 0;
        snapshotSlots.forEach(doc => {
          const data = doc.data();
          if (data.ocupado) ocupados += 1;
        });
        const taxaOcupacao = totalSlots > 0 ? Math.round((ocupados / totalSlots) * 100) : 0;

        // 4. Feedback Médio (supondo coleção avaliações com campo 'nota')
        const avaliacoesRef = collection(db, "avaliacoes");
        const snapshotAvaliacoes = await getDocs(avaliacoesRef);
        let somaNotas = 0;
        let totalAvaliacoes = 0;
        snapshotAvaliacoes.forEach(doc => {
          const data = doc.data();
          if (typeof data.nota === "number") {
            somaNotas += data.nota;
            totalAvaliacoes += 1;
          }
        });
        const feedbackMedio = totalAvaliacoes > 0 ? (somaNotas / totalAvaliacoes).toFixed(1) : "Sem avaliações";

        setDados({
          agendamentosHoje,
          faturamentoDiario,
          taxaOcupacao,
          feedbackMedio: typeof feedbackMedio === "string" ? 0 : Number(feedbackMedio),
        });
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        setError("Erro ao carregar dados. Tente novamente mais tarde.");
      }

      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-white">Carregando dados do dashboard...</div>;
  if (error) return <div className="p-8 text-red-500 font-bold">{error}</div>;
  if (!dados)
    return <div className="p-8 text-white">Nenhum dado disponível no momento.</div>;

  const kpis = [
    { title: "Agendamentos Hoje", value: dados.agendamentosHoje },
    { title: "Faturamento Diário", value: `R$ ${dados.faturamentoDiario}` },
    { title: "Taxa de Ocupação", value: `${dados.taxaOcupacao}%` },
    { title: "Feedback Médio", value: dados.feedbackMedio },
  ];

  return (
    <div className="p-8">
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
    </div>
  );
}
