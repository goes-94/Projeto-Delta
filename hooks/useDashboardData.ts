import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

interface DashboardData {
  agendamentosHoje: number;
  faturamentoDiario: number;
  taxaOcupacao: number;
  feedbackMedio: number;
}

export function useDashboardData() {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function buscarDados() {
      setLoading(true);
      setError(null);

      try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const amanha = new Date(hoje);
        amanha.setDate(hoje.getDate() + 1);

        // 1. Buscar agendamentos do dia
        const agendamentosRef = collection(db, "agendamentos");
        const qAgend = query(
          agendamentosRef,
          where("data", ">=", Timestamp.fromDate(hoje)),
          where("data", "<", Timestamp.fromDate(amanha))
        );
        const agendamentosSnap = await getDocs(qAgend);
        const agendamentosHoje = agendamentosSnap.size;

        // 2. Buscar faturamento do dia na coleção Relatorios (id é 'yyyy-MM-dd')
        const docId = hoje.toISOString().slice(0, 10);
        const relatorioRef = doc(db, "Relatorios", docId);
        const relatorioSnap = await getDoc(relatorioRef);
        const faturamentoDiario =
          relatorioSnap.exists() && relatorioSnap.data().faturamento
            ? relatorioSnap.data().faturamento
            : 0;

        // 3. Calcular taxa de ocupação
        const totalHorariosDisponiveis = 20;
        const taxaOcupacao =
          totalHorariosDisponiveis > 0
            ? Math.round((agendamentosHoje / totalHorariosDisponiveis) * 100)
            : 0;

        // 4. Feedback médio fixo (por enquanto)
        const feedbackMedio = 5.0;

        // Atualiza estado explicitamente com objeto DashboardData
        setDados({
          agendamentosHoje,
          faturamentoDiario,
          taxaOcupacao,
          feedbackMedio,
        });
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setError("Erro ao carregar dados do dashboard.");
        setDados(null);
      } finally {
        setLoading(false);
      }
    }

    buscarDados();
  }, []);

  return { dados, loading, error };
}
    