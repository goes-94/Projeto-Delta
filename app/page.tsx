"use client";

import { useEffect, useState } from "react";
import { collection, query, where, Timestamp, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";


interface Agendamento {
  id: string;
  cliente: string;
  servico: string;
  data: Timestamp | string;
  horario: string | Timestamp;
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

  const agendamentosRef =
    collection(db, "agendamentos");

  const unsubscribe = onSnapshot(
    agendamentosRef,

    async (snapshot) => {
      try {
        console.log(
          "===== DASHBOARD ====="
        );

        console.log(
          "TOTAL DOCUMENTOS:",
          snapshot.size
        );

        const listaAgendamentos: Agendamento[] =
          snapshot.docs.map((doc) => {
            const data = doc.data();

            let valor = 0;

            if (
              typeof data.valor ===
              "number"
            ) {
              valor = data.valor;
            } else if (
              typeof data.valor ===
              "string"
            ) {
              valor =
                parseFloat(
                  data.valor
                    .replace("R$", "")
                    .replace(/\./g, "")
                    .replace(",", ".")
                    .trim()
                ) || 0;
            }

            console.log(
              "Documento:",
              doc.id,
              data
            );

            return {
              id: doc.id,
              cliente:
                data.cliente ?? "",
              servico:
                data.servico ?? "",
              data:
                data.data ?? "",
              horario:
                data.horario ?? "",
              valor,
              status:
                data.status ??
                "pendente",
            };
          });

        const hoje = new Date();

const hojeBR =
  hoje.toLocaleDateString("pt-BR");

const agendamentosHojeLista =
  listaAgendamentos.filter(
    (item) => {
      if (
        !item.data ||
        item.status ===
          "cancelado"
      ) {
        return false;
      }

      const dataAgendamento =
        typeof item.data ===
        "string"
          ? item.data
          : item.data
              .toDate()
              .toLocaleDateString(
                "pt-BR"
              );

      return (
        dataAgendamento ===
        hojeBR
      );
    }
  );

        const agendamentosHoje =
          agendamentosHojeLista.length;

        const faturamentoDiario =
          agendamentosHojeLista
            .filter(
              (item) =>
                item.status ===
                "concluido"
            )
            .reduce(
              (acc, item) =>
                acc + item.valor,
              0
            );

        let taxaOcupacao = 0;
        let feedbackMedio = 0;

        /* SLOTS */

        /* MEMBROS */

        try {
          const membrosSnapshot =
            await getDocs(
              collection(
                db,
                "membros"
              )
            );

          const totalMembros =
            membrosSnapshot.size;

          const vagasPorMembro = 8;

          const capacidadeDoDia =
            totalMembros *
            vagasPorMembro;

          const ocupadosHoje =
            agendamentosHojeLista.filter(
              (agendamento) =>
                agendamento.status !==
                "cancelado"
            ).length;

          taxaOcupacao =
            capacidadeDoDia > 0
              ? Math.round(
                  (
                    ocupadosHoje /
                    capacidadeDoDia
                  ) * 100
                )
              : 0;

          console.log(
            "MEMBROS:",
            totalMembros
          );

          console.log(
            "CAPACIDADE DO DIA:",
            capacidadeDoDia
          );

          console.log(
            "AGENDAMENTOS HOJE:",
            ocupadosHoje
          );

          console.log(
            "TAXA DE OCUPAÇÃO:",
            taxaOcupacao + "%"
          );

        } catch (error) {
          console.error(
            "Erro ao consultar membros:",
            error
          );
        }

        /* AVALIAÇÕES */

        try {
          const avaliacoesSnapshot =
            await getDocs(
              collection(
                db,
                "avaliacoes"
              )
            );

          let somaNotas = 0;
          let totalNotas = 0;

          avaliacoesSnapshot.forEach(
            (doc) => {
              const avaliacao =
                doc.data();

              if (
                typeof avaliacao.nota ===
                "number"
              ) {
                somaNotas +=
                  avaliacao.nota;

                totalNotas++;
              }
            }
          );

          feedbackMedio =
            totalNotas > 0
              ? Number(
                  (
                    somaNotas /
                    totalNotas
                  ).toFixed(1)
                )
              : 0;

          console.log(
            "TOTAL NOTAS:",
            totalNotas
          );

          console.log(
            "MÉDIA:",
            feedbackMedio
          );
        } catch (error) {
          console.error(
            "Erro Avaliações:",
            error
          );
        }

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
        console.error(
          "Erro Dashboard:",
          error
        );

        setError(
          "Erro ao processar dados."
        );

        setLoading(false);
      }
    },

    (error) => {
      console.error(
        "Erro Firestore:",
        error
      );

      setError(
        "Erro na conexão com Firestore."
      );

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

      {/* <div className="bg-navy-900 p-6 rounded-xl border border-navy-800 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Agendamentos do Dia</h2>
        <ul className="list-disc list-inside">
          {dados.listaAgendamentos.map((ag) => (
            <li key={ag.id} className="mb-2">
              <strong>{ag.cliente}</strong> - {ag.servico} - {formatarData(ag.data)} - {ag.horario} - {formatarValor(ag.valor)}
            </li>
          ))}
        </ul>
      </div> */}
    </div>
  );
}
