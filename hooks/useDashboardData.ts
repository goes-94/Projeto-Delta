import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState(null);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);

      const hoje = new Date().toISOString().slice(0, 10);
      const agendamentosRef = collection(db, "agendamentos");
      const q = query(agendamentosRef, where("data", "==", hoje));
      const snapshot = await getDocs(q);
      const agendamentosHoje = snapshot.size;

      // Stub para os outros valores, substitua pelas consultas reais depois
      const faturamentoDiario = 1250;
      const taxaOcupacao = 85;
      const feedbackMedio = 4.8;

      setDados({ agendamentosHoje, faturamentoDiario, taxaOcupacao, feedbackMedio });
      setLoading(false);
    }

    carregarDados();
  }, []);

  return { dados, loading };
}
