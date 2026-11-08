import { useState, useEffect } from "react";
import { collection, query, where, Timestamp, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface Agendamento {
  id: string;
  valor: number;
  valorPago?: number;
  data: Timestamp;
}

interface DashboardResumo {
  agendamentosHoje: number;
  faturamentoDiario: number;
  ticketMedio: number;
}

export function useDashboardResumo() {
  const [dados, setDados] = useState<DashboardResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    const hojeInicio = new Date();
    hojeInicio.setHours(0, 0, 0, 0);

    const hojeFim = new Date();
    hojeFim.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, "agendamentos"),
      where("data", ">=", Timestamp.fromDate(hojeInicio)),
      where("data", "<=", Timestamp.fromDate(hojeFim))
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const agendamentos: Agendamento[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              data: data.data,
              valor: data.valor ?? 0,
              valorPago: data.valorPago ?? 0,
            };
          });

          const agendamentosHoje = agendamentos.length;
          const faturamentoDiario = agendamentos.reduce(
            (acc, ag) => acc + (ag.valorPago || ag.valor || 0),
            0
          );
          const ticketMedio =
            agendamentosHoje > 0 ? faturamentoDiario / agendamentosHoje : 0;

          setDados({
            agendamentosHoje,
            faturamentoDiario,
            ticketMedio,
          });
          setLoading(false);
          setError(null);
        } catch (err) {
          setError("Erro ao processar dados do dashboard.");
          setLoading(false);
          setDados(null);
        }
      },
      (error) => {
        setError("Erro na conexão com o Firestore.");
        setLoading(false);
        setDados(null);
      }
    );

    return () => unsubscribe();
  }, []);

  return { dados, loading, error };
}
