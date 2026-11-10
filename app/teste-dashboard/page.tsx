"use client";

import React from "react";
import { useDashboardData } from "../../hooks/useDashboardData"; // ajuste do nome do hook

export default function TesteDashboard() {
  const { dados, loading, error } = useDashboardData();

  if (loading) return <p className="text-white p-6">Carregando dados do dashboard...</p>;
  if (error) return <p className="text-red-500 p-6 font-bold">Erro: {error}</p>;
  if (!dados) return <p className="text-white p-6">Nenhum dado disponível.</p>;

  return (
    <div className="p-6 text-white space-y-4 max-w-xl mx-auto bg-navy-900 rounded-lg">
      <h1 className="text-3xl font-bold">Dashboard Resumo</h1>

      <div>
        <strong>Agendamentos Hoje:</strong> {dados.agendamentosHoje}
      </div>
      <div>
        <strong>Faturamento Diário:</strong>{" "}
        {dados.faturamentoDiario.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </div>
      <div>
        <strong>Ticket Médio:</strong>{" "}
        {dados.ticketMedio.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </div>
    </div>
  );
}
