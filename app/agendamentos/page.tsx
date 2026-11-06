"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

interface Agendamento {
  id: string;
  cliente: string;
  servico: string;
  data: Timestamp | string;   // pode vir Timestamp ou string (se houver)
  horario: string;
  valor: Number  ;              // alterar para number (não Timestamp)
  status: string;
}

// Função para formatar preço em Real
function formatarValor(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para formatar data
function formatarData(data: Timestamp | string) {
  if (!data) return "";
  if (typeof data === "string") return data;
  return data.toDate().toLocaleDateString('pt-BR');
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function buscarAgendamentos() {
      setLoading(true);
      try {
        const agendamentosRef = collection(db, "agendamentos");
        let q;

        if (searchTerm.trim()) {
          // Firestore não suporta OR, então buscamos por cliente que começa com searchTerm
          q = query(
            agendamentosRef,
            where("cliente", ">=", searchTerm),
            where("cliente", "<=", searchTerm + "\uf8ff")
          );
        } else {
          q = query(agendamentosRef);
        }

        const snapshot = await getDocs(q);
        const lista: Agendamento[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const valorRaw = data.valor;
          return {
            id: doc.id,
            cliente: data.cliente || "",
            servico: data.servico || "",
            data: data.data || "",
            horario: data.horario || "",
            valor: typeof valorRaw === "number" ? valorRaw : parseFloat(valorRaw?.replace(/[^\d.,]/g, "").replace(",", ".") || "0"),            
            status: data.status || "pendente",
          };
        });

        setAgendamentos(lista);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      }
      setLoading(false);
    }

    buscarAgendamentos();
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Agendamentos</h1>
          <p className="text-slate-400">Gerencie a agenda da sua unidade</p>
        </div>
        <Link href="/calendario" passHref>
          <button className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all">
            <Plus size={20} />
            Novo Agendamento
          </button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 bg-navy-900 p-4 rounded-xl border border-navy-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por cliente ou serviço..."
            className="w-full bg-navy-800 border border-navy-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-navy-800 border border-navy-700 rounded-lg text-slate-300 hover:text-white">
          <Filter size={18} />
          Filtros
        </button>
      </div>

      {/* Lista */}
      <div className="bg-navy-900 border border-navy-800 rounded-xl p-8">
        {loading ? (
          <p className="text-slate-400 text-center">Carregando agendamentos...</p>
        ) : agendamentos.length === 0 ? (
          <p className="text-slate-500 text-center">Nenhum agendamento encontrado para este período.</p>
        ) : (
          <table className="w-full table-fixed text-white">
            <thead>
              <tr className="border-b border-navy-800">
                <th className="text-left py-2 px-4">Cliente</th>
                <th className="text-left py-2 px-4">Serviço</th>
                <th className="text-left py-2 px-4">Data</th>
                <th className="text-left py-2 px-4">Valor</th>
                <th className="text-left py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos.map((ag) => (
                <tr key={ag.id} className="border-b border-navy-800 hover:bg-navy-800 cursor-pointer">
                  <td className="py-2 px-4">{ag.cliente}</td>
                  <td className="py-2 px-4">{ag.servico}</td>
                  <td className="py-2 px-4">{formatarData(ag.data)}</td>
                  <td className="py-2 px-4">{formatarValor(ag.valor)}</td>
                  <td className="py-2 px-4 capitalize">{ag.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
