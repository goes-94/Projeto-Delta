"use client";

import { Plus, Search, MoreHorizontal, Clock, DollarSign } from "lucide-react";

export default function ServicosPage() {
  // Mock de dados para visualizar a estrutura
  const servicos = [
    { id: 1, nome: "Corte Masculino", duracao: "30 min", preco: "R$ 60,00", categoria: "Cabelo" },
    { id: 2, nome: "Barba Tradicional", duracao: "20 min", preco: "R$ 40,00", categoria: "Barba" },
    { id: 3, nome: "Coloração Completa", duracao: "90 min", preco: "R$ 180,00", categoria: "Química" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Serviços</h1>
          <p className="text-slate-400">Gerencie seu catálogo de serviços e preços</p>
        </div>
        <button className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all">
          <Plus size={20} />
          Adicionar Serviço
        </button>
      </div>

      {/* Tabela de Serviços */}
      <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-navy-800 text-slate-400 text-sm">
              <th className="p-4 font-medium">Nome do Serviço</th>
              <th className="p-4 font-medium">Categoria</th>
              <th className="p-4 font-medium">Duração</th>
              <th className="p-4 font-medium">Preço</th>
              <th className="p-4 font-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800">
            {servicos.map((servico) => (
              <tr key={servico.id} className="hover:bg-navy-800/50 transition-colors">
                <td className="p-4 font-medium text-white">{servico.nome}</td>
                <td className="p-4 text-slate-400">{servico.categoria}</td>
                <td className="p-4 text-slate-400 flex items-center gap-1">
                  <Clock size={14} /> {servico.duracao}
                </td>
                <td className="p-4 text-gold-500 font-semibold">{servico.preco}</td>
                <td className="p-4 text-right">
                  <button className="text-slate-500 hover:text-white">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
