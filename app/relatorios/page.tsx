"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

interface FaturamentoDia {
  dia: string;
  data: string;
  valor: number;
  percent: number;
}

export default function RelatoriosPage() {
  const [receitaPrevista, setReceitaPrevista] = useState(0);
  const [receitaRealizada, setReceitaRealizada] =
    useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);
  const [agendamentosCount, setAgendamentosCount] = useState(0);
  const [faturamentoSemanal, setFaturamentoSemanal] = useState<
    FaturamentoDia[]
  >([]);

  useEffect(() => {
    async function carregarDados() {
      try {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = hoje.getMonth();

        const inicioMes = new Date(ano, mes, 1);
        inicioMes.setHours(0, 0, 0, 0);

        const fimMes = new Date(ano, mes + 1, 0);
        fimMes.setHours(23, 59, 59, 999);

        const agendamentosRef = collection(db, "agendamentos");

        const qPagamentos = query(
          agendamentosRef,
          where("data", ">=", Timestamp.fromDate(inicioMes)),
          where("data", "<=", Timestamp.fromDate(fimMes))
        );

        const pagamentosSnapshot = await getDocs(qPagamentos);

        let somaPrevista = 0;
        let somaRealizada = 0;
        let totalAgendamentos = 0;

        pagamentosSnapshot.forEach((doc) => {
        const item = doc.data();

        if (
            typeof item.valor !== "number"
        ) {
            return;
        }

        // cancelado não conta para nada
        if (
            item.status === "cancelado"
        ) {
            return;
        }

        totalAgendamentos++;

        // previsto
        // Receita prevista
        if (
        item.status === "pendente" ||
        item.status === "confirmado"
        ) {
        somaPrevista += item.valor;
        }

        // Receita realizada
        if (
        item.status === "concluido"
        ) {
        somaRealizada += item.valor;
        }
        });

        setReceitaPrevista(
        somaPrevista
        );

        setReceitaRealizada(
        somaRealizada
        );

        setAgendamentosCount(
        totalAgendamentos
        );

        setTicketMedio(
        totalAgendamentos > 0
            ? Math.round(
                somaRealizada /
                totalAgendamentos
            )
            : 0
        );

        // =========================
        // FATURAMENTO DOS ÚLTIMOS 7 DIAS
        // =========================

        const diasSemana = [
        "Dom",
        "Seg",
        "Ter",
        "Qua",
        "Qui",
        "Sex",
        "Sáb",
        ];

        const valoresSemana: FaturamentoDia[] = [];

        for (let i = 6; i >= 0; i--) {
        const diaAtual = new Date();
        diaAtual.setDate(hoje.getDate() - i);

        let somaDia = 0;

        pagamentosSnapshot.forEach((doc) => {
            const item = doc.data();

            // Ignora registros inválidos
            if (
            !item.data ||
            typeof item.valor !== "number"
            ) {
            return;
            }

            // Ignora cancelados
            if (item.status === "cancelado") {
            return;
            }

            const dataAgendamento =
            item.data.toDate();

            // Compara usando a data formatada
            // para evitar problemas de timezone
            const dataItem =
            dataAgendamento.toLocaleDateString(
                "pt-BR"
            );

            const dataTela =
            diaAtual.toLocaleDateString(
                "pt-BR"
            );

            if (dataItem === dataTela) {
            somaDia += item.valor;
            }
        });

        valoresSemana.push({
            dia: diasSemana[diaAtual.getDay()],
            data: diaAtual.toLocaleDateString(
            "pt-BR"
            ),
            valor: somaDia,
            percent: 0,
        });
        }

        const maxValor =
        Math.max(
            ...valoresSemana.map(
            (v) => v.valor
            )
        ) || 1;

        const valoresComPercent =
        valoresSemana.map((v) => ({
            ...v,
            percent: Math.round(
            (v.valor / maxValor) * 100
            ),
        }));

        setFaturamentoSemanal(
        valoresComPercent
        );

        setFaturamentoSemanal(valoresComPercent);
      } catch (error) {
        console.error(
          "Erro ao carregar dados do relatório:",
          error
        );
      }
    }

    carregarDados();
  }, []);

  function formatarValor(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Relatórios
        </h1>
        <p className="text-slate-400">
          Visão consolidada de desempenho
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl">
          <p className="text-slate-400 text-sm">
            Receita Prevista
            </p>

            <h3 className="text-2xl font-bold text-yellow-400 mt-1">
            {formatarValor(receitaPrevista)}
            </h3>
        </div>
        <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl">
            <p className="text-slate-400 text-sm">
                Receita Realizada
            </p>

            <h3 className="text-2xl font-bold text-green-400 mt-1">
                {formatarValor(receitaRealizada)}
            </h3>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl">
          <p className="text-slate-400 text-sm">
            Ticket Médio
          </p>
          <h3 className="text-2xl font-bold text-white mt-1">
            {formatarValor(ticketMedio)}
          </h3>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl">
          <p className="text-slate-400 text-sm">
            Agendamentos
          </p>
          <h3 className="text-2xl font-bold text-white mt-1">
            {agendamentosCount}
          </h3>
        </div>
      </div>

      <div className="bg-navy-900 border border-navy-800 p-8 rounded-xl">
        <h3 className="text-white font-semibold mb-8">
          Faturamento Semanal (R$)
        </h3>

        <div className="space-y-6">
          {faturamentoSemanal.map((item) => (
            <div
              key={`${item.dia}-${item.data}`}
              className="flex items-center gap-4"
            >
              <span className="w-10 text-sm text-slate-400 font-medium">
                {item.dia}
              </span>

              <div className="flex-1 h-4 bg-navy-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-500 rounded-full transition-all duration-500"
                  style={{ width: `${item.percent}%` }}
                />
              </div>

              <span className="w-20 text-right text-white font-bold text-sm">
                {formatarValor(item.valor)}
              </span>

              <span className="w-24 text-sm text-slate-400 font-medium">
                {item.dia} - {item.data}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}