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
  // Você pode adicionar mais indicadores aqui, como taxaOcupacao, feedback, etc.
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

    const agendamentosRef = collection(db, "agendamentos");
    const q = query(
      agendamentosRef,
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
              valor:
                typeof data.valor === "number"
                  ? data.valor
                  : parseFloat(
                      (data.valor || "")
                        .toString()
                        .replace(/[^\d.,]/g, "")
                        .replace(",", ".")
                    ) || 0,
              valorPago:
                typeof data.valorPago === "number"
                  ? data.valorPago
                  : parseFloat(
                      (data.valorPago || "")
                        .toString()
                        .replace(/[^\d.,]/g, "")
                        .replace(",", ".")
                    ) || 0,
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
