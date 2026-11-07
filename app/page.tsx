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

interface DashboardData {
  agendamentosHoje: number;
  faturamentoDiario: number;
  taxaOcupacao: number;
  feedbackMedio: number;
  listaAgendamentos: Agendamento[];
}

export default function DashboardPage() {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
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

    // Consulta para slots e avaliações (dados auxiliares)
    async function buscarDadosAux() {
      try {
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
      } catch (err) {
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
                  : 0, // como valor agora é double, garantimos que é número
              status: data.status || "pendente",
            };
          });

          const agendamentosHoje = listaAgendamentos.length;
          const faturamentoDiario = listaAgendamentos.reduce((acc, ag) => acc + ag.valor, 0);

          const { taxaOcupacao, feedbackMedio } = await buscarDadosAux();

          setDados({
            agendamentosHoje,
            faturamentoDiario,
            taxaOcupacao,
            feedbackMedio,
            listaAgendamentos,
          });

          setLoading(false);
          setError(null);
        } catch (error) {
          setError("Erro ao processar dados do dashboard.");
          setLoading(false);
        }
      },
      (error) => {
        setError("Erro na conexão com Firestore.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-8 text-white">Carregando dados...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!dados) return <div className="p-8 text-white">Nenhum dado disponível.</div>;

  return (
    <div className="p-8 space-y-8 text-white">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-navy-900 p-6 rounded-xl border border-navy-800 hover:border-gold-500 transition">
          <h3 className="text-slate-400 text-sm">Agendamentos Hoje</h3>
          <p className="text-2xl font-bold">{dados.agendamentosHoje}</p>
        </div>

        <div className="bg-navy-900 p-6 rounded-xl border border-navy-800 hover:border-gold-500 transition">
          <h3 className="text-slate-400 text-sm">Faturamento Diário</h3>
          <p className="text-2xl font-bold">{dados.faturamentoDiario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>

        <div className="bg-navy-900 p-6 rounded-xl border border-navy-800 hover:border-gold-500 transition">
          <h3 className="text-slate-400 text-sm">Taxa de Ocupação</h3>
          <p className="text-2xl font-bold">{dados.taxaOcupacao}%</p>
        </div>

        <div className="bg-navy-900 p-6 rounded-xl border border-navy-800 hover:border-gold-500 transition">
          <h3 className="text-slate-400 text-sm">Feedback Médio</h3>
          <p className="text-2xl font-bold">{dados.feedbackMedio}</p>
        </div>
      </div>

      <div className="bg-navy-900 p-6 rounded-xl border border-navy-800 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Agendamentos do Dia</h2>
        <ul className="list-disc list-inside">
          {dados.listaAgendamentos.map((ag) => (
            <li key={ag.id} className="mb-2">
              <strong>{ag.cliente}</strong> - {ag.servico} - {formatarData(ag.data)} - {ag.horario} - {formatarValor(ag.valor)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
