// hooks/useRelatorios.ts

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface AgendamentosData {
  faturamentoDiario: number;
  agendamentosHoje: number;
  ticketMedio: number;
}

export function useRelatorios() {
  const [dados, setDados] = useState<AgendamentosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDados() {
      setLoading(true);
      setError(null);
      try {
        const hojeInicio = new Date();
        hojeInicio.setHours(0, 0, 0, 0);
        const hojeFim = new Date();
        hojeFim.setHours(23, 59, 59, 999);

        // Buscar agendamentos do dia
        const agendamentosRef = collection(db, "agendamentos");
        const qAgend = query(
          agendamentosRef,
          where("data", ">=", Timestamp.fromDate(hojeInicio)),
          where("data", "<=", Timestamp.fromDate(hojeFim))
        );
        const agendamentosSnap = await getDocs(qAgend);

        let somaFaturamento = 0;
        agendamentosSnap.forEach((doc) => {
          const data = doc.data();
          somaFaturamento += typeof data.valorPago === "number" ? data.valorPago : 0;
        });
        const countAgend = agendamentosSnap.size;

        const ticket = countAgend > 0 ? somaFaturamento / countAgend : 0;

        setDados({
          faturamentoDiario: somaFaturamento,
          agendamentosHoje: countAgend,
          ticketMedio: Math.round(ticket),
        });
      } catch (err) {
        setError("Erro ao carregar dados.");
        setDados(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDados();
  }, []);

  return { dados, loading, error };
}
