import { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface DashboardData {
  agendamentosHoje: number;
  faturamentoDiario: number;
  taxaOcupacao: number;
  feedbackMedio: number;
}

export function useDashboardData() {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buscarDados() {
      setLoading(true);

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const tomorrow = new Date(hoje);
      tomorrow.setDate(hoje.getDate() + 1);

      // 1. Buscar agendamentos do dia
      const agendamentosRef = collection(db, "agendamentos");
      const qAgend = query(
        agendamentosRef,
        where("data", ">=", Timestamp.fromDate(hoje)),
        where("data", "<", Timestamp.fromDate(tomorrow))
      );
      const agendamentosSnap = await getDocs(qAgend);
      const agendamentosHoje = agendamentosSnap.size;

      // 2. Buscar faturamento do dia na coleção Relatorios (supondo documento com id do dia yyyy-MM-dd)
      const docId = hoje.toISOString().slice(0, 10); // formato yyyy-MM-dd
      const relatorioRef = doc(db, "Relatorios", docId);
      const relatorioSnap = await getDoc(relatorioRef);
      const faturamentoDiario = relatorioSnap.exists() ? relatorioSnap.data().faturamento : 0;

      // 3. Calcular taxa de ocupação
      // Supondo total de horários disponíveis fixo para exemplo, ex: 20
      const totalHorariosDisponiveis = 20;
      const taxaOcupacao = totalHorariosDisponiveis > 0 ? Math.round((agendamentosHoje / totalHorariosDisponiveis) * 100) : 0;

      // 4. Feedback medio fixo por enquanto
      const feedbackMedio = 5.0;

      setDados({
        agendamentosHoje,
        faturamentoDiario,
        taxaOcupacao,
        feedbackMedio,
      });

      setLoading(false);
    }

    buscarDados();
  }, []);

  return { dados, loading };
}
