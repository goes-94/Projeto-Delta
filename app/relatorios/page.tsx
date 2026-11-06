"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

interface FaturamentoDia {
  dia: string;
  valor: number;
  percent: number;
}

export default function RelatoriosPage() {
  const [receitaMensal, setReceitaMensal] = useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);
  const [agendamentosCount, setAgendamentosCount] = useState(0);
  const [faturamentoSemanal, setFaturamentoSemanal] = useState<FaturamentoDia[]>([]);

  useEffect(() => {
    async function carregarDados() {
      // Datas para filtro
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = hoje.getMonth();

      // Inicio e fim do mês atual
      const inicioMes = new Date(ano, mes, 1);
      const fimMes = new Date(ano, mes + 1, 0, 23, 59, 59);

      // Buscar pagamentos do mês para receita mensal e ticket médio
      const pagamentosRef = collection(db, "pagamentos");
      const qPagamentos = query(
        pagamentosRef,
        where("data", ">=", Timestamp.fromDate(inicioMes)),
        where("data", "<=", Timestamp.fromDate(fimMes))
      );

      const pagamentosSnapshot = await getDocs(qPagamentos);

      let somaPagamentos = 0;
      pagamentosSnapshot.forEach(doc=>{
        const data = doc.data();
        somaPagamentos += data.valor || 0;
      });
      setReceitaMensal(somaPagamentos);

      // Buscar agendamentos no mês para ticket médio (soma / quantidade)
      const agendamentosRef = collection(db, "agendamentos");
      const qAgendamentos = query(
        agendamentosRef,
        where("data", ">=", Timestamp.fromDate(inicioMes)),
        where("data", "<=", Timestamp.fromDate(fimMes))
      );
      const agendamentosSnapshot = await getDocs(qAgendamentos);
      const totalAgendamentosMes = agendamentosSnapshot.size;

      setAgendamentosCount(totalAgendamentosMes);

      setTicketMedio(totalAgendamentosMes > 0 ? Math.round(somaPagamentos / totalAgendamentosMes) : 0);

      // Buscar faturamento semanal
      // Calcular datas dos últimos 6 dias + hoje
      const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const valoresSemana: FaturamentoDia[] = [];

      for (let i = 6; i >= 0; i--) {
        const diaAtual = new Date();
        diaAtual.setDate(hoje.getDate() - i);
        const inicioDia = new Date(diaAtual);
        inicioDia.setHours(0,0,0,0);
        const fimDia = new Date(diaAtual);
        fimDia.setHours(23,59,59,999);

        const qDia = query(
          pagamentosRef,
          where("data", ">=", Timestamp.fromDate(inicioDia)),
          where("data", "<=", Timestamp.fromDate(fimDia))
        );

        const pagosDiaSnap = await getDocs(qDia);
        let somaDia = 0;
        pagosDiaSnap.forEach(doc => {
          const data = doc.data();
          somaDia += data.valor || 0;
        });

        valoresSemana.push({
          dia: diasSemana[diaAtual.getDay()],
          valor: somaDia,
          percent: 0, // calcular depois
        });
      }

      // calcular % para barra do gráfico
      const maxValor = Math.max(...valoresSemana.map(v => v.valor)) || 1;
      const valoresComPercent = valoresSemana.map(v => ({
        ...v,
        percent: Math.round((v.valor / maxValor) * 100)
      }));

      setFaturamentoSemanal(valoresComPercent);
    }

    carregarDados();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        <p className="text-slate-400">Visão consolidada de desempenho</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl">
          <p className="text-slate-400 text-sm">Receita Mensal</p>
          <h3 className="text-2xl font-bold text-white mt-1">R$ {receitaMensal}</h3>
        </div>
        <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl">
          <p className="text-slate-400 text-sm">Ticket Médio</p>
          <h3 className="text-2xl font-bold text-white mt-1">R$ {ticketMedio}</h3>
        </div>
        <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl">
          <p className="text-slate-400 text-sm">Agendamentos</p>
          <h3 className="text-2xl font-bold text-white mt-1">{agendamentosCount}</h3>
        </div>
      </div>

      {/* Relatório Visual Nativo (Sem dependências) */}
      <div className="bg-navy-900 border border-navy-800 p-8 rounded-xl">
        <h3 className="text-white font-semibold mb-8">Faturamento Semanal (R$)</h3>
      
        <div className="space-y-6">
          {faturamentoSemanal.map((item) => (
            <div key={item.dia} className="flex items-center gap-4">
              <span className="w-10 text-sm text-slate-400 font-medium">{item.dia}</span>
              <div className="flex-1 h-4 bg-navy-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-500 rounded-full transition-all duration-500"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
              <span className="w-20 text-right text-white font-bold text-sm">R$ {item.valor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
