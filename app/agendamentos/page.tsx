"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

async function alterarStatus(
  id: string,
  novoStatus: string
) {
  try {
    await updateDoc(
      doc(db, "agendamentos", id),
      {
        status: novoStatus,
      }
    );

    console.log(
      `Status atualizado para ${novoStatus}`
    );
  } catch (error) {
    console.error(
      "Erro ao atualizar status:",
      error
    );
  }
}

interface Agendamento {
  id: string;
  cliente: string;
  servico: string;
  data: Timestamp | string;
  horario: string;
  valor: number;  // Corrigido para number
  status: string;
}

function formatarValor(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data: Timestamp | string) {
  if (!data) return "";
  if (typeof data === "string") {
    const d = new Date(data);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString('pt-BR');
  }
  return data.toDate().toLocaleDateString('pt-BR');
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function buscarAgendamentos() {
      setLoading(true);
      try {
        const agendamentosRef = collection(db, "agendamentos");
        const q = searchTerm.trim()
          ? query(
              agendamentosRef,
              where("cliente", ">=", searchTerm),
              where("cliente", "<=", searchTerm + "\uf8ff")
            )
          : query(agendamentosRef);

        const snapshot = await getDocs(q);
        const lista: Agendamento[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            cliente: data.cliente || "",
            servico: data.servico || "",
            data: data.data || "",
            horario: data.horario || "",
            valor: typeof data.valor === "number" ? data.valor : 0,
            status: data.status || "pendente",
          };
        });
        setAgendamentos(lista);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      } finally {
        setLoading(false);
      }
    }
    buscarAgendamentos();
  }, [searchTerm]);

  return (
    <div className="space-y-6">
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

      <div className="flex gap-4 bg-navy-900 p-4 rounded-xl border border-navy-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por cliente ou serviço..."
            className="w-full bg-navy-800 border border-navy-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-navy-800 border border-navy-700 rounded-lg text-slate-300 hover:text-white">
          <Filter size={18} />
          Filtros
        </button>
      </div>

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
                  <td className="py-2 px-4">
                    <select
                        value={ag.status || "pendente"}
                        onChange={(e) =>
                        alterarStatus(
                            ag.id,
                            e.target.value
                        )
                        }
                        className={`
                        px-3 py-1 rounded-md
                        text-sm font-medium
                        border
                        ${
                            ag.status === "concluido"
                            ? "bg-green-600 border-green-500 text-white"
                            : ag.status === "cancelado"
                            ? "bg-red-600 border-red-500 text-white"
                            : ag.status === "confirmado"
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "bg-yellow-600 border-yellow-500 text-white"
                        }
                        `}
                        >
                        <option value="pendente">
                        Pendente
                        </option>

                        <option value="confirmado">
                        Confirmado
                        </option>

                        <option value="concluido">
                        Concluído
                        </option>

                        <option value="cancelado">
                        Cancelado
                        </option>
                    </select>
                    </td>
                </tr>
                
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
