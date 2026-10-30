import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
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
    async function fetchData() {
      setLoading(true);
      // ... suas consultas para montar os dados aqui

      const agendamentosHoje = 10; // exemplo
      const faturamentoDiario = 2000;
      const taxaOcupacao = 90;
      const feedbackMedio = 4.5;

      setDados({
        agendamentosHoje,
        faturamentoDiario,
        taxaOcupacao,
        feedbackMedio,
      });

      setLoading(false);
    }

    fetchData();
  }, []);

  return { dados, loading };
}
