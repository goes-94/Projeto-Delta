"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Plus, Search, MoreHorizontal, Clock, DollarSign, X } from "lucide-react";

interface Servico {
  id: string;
  nome: string;
  categoria: string;
  duracao: string; // exemplo: "30 min"
  preco: number; // valor numérico para facilitar cálculos, ex: 60.0
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [novoServico, setNovoServico] = useState({
    nome: "",
    categoria: "",
    duracao: "",
    preco: "",
  });

  useEffect(() => {
    // Atualiza em tempo real a lista de serviços a partir do Firestore
    const unsub = onSnapshot(collection(db, "servicos"), (snapshot) => {
      const lista: Servico[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Servico[];
      setServicos(lista);
    });
    return () => unsub();
  }, []);

  async function salvarServico(e: React.FormEvent) {
    e.preventDefault();
    // Validação simples
    if (!novoServico.nome || !novoServico.categoria || !novoServico.duracao || !novoServico.preco) return;

    try {
      const precoNumero = parseFloat(novoServico.preco.replace(",", "."));
      await addDoc(collection(db, "servicos"), {
        nome: novoServico.nome,
        categoria: novoServico.categoria,
        duracao: novoServico.duracao,
        preco: precoNumero,
      });
      setModalAberto(false);
      setNovoServico({ nome: "", categoria: "", duracao: "", preco: "" });
    } catch (error) {
      alert("Erro ao salvar serviço.");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setNovoServico({ ...novoServico, [e.target.name]: e.target.value });
  }

  // Função para formatar preço em Real
  function formatarPreco(valor: number) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Serviços</h1>
          <p className="text-slate-400">Gerencie seu catálogo de serviços e preços</p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
        >
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
                <td className="p-4 text-gold-500 font-semibold">{formatarPreco(servico.preco)}</td>
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

      {/* Modal para adicionar serviço */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-navy-900 p-6 rounded-lg w-full max-w-md relative">
            <button
              onClick={() => setModalAberto(false)}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-white">Adicionar Serviço</h2>

            <form onSubmit={salvarServico} className="space-y-4">
              <input
                type="text"
                name="nome"
                placeholder="Nome do serviço"
                value={novoServico.nome}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white"
              />
              <input
                type="text"
                name="categoria"
                placeholder="Categoria"
                value={novoServico.categoria}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white"
              />
              <input
                type="text"
                name="duracao"
                placeholder="Duração (ex: 30 min)"
                value={novoServico.duracao}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white"
              />
              <input
                type="text"
                name="preco"
                placeholder="Preço (ex: 60,00)"
                value={novoServico.preco}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white"
              />

              <button
                type="submit"
                className="bg-gold-500 w-full py-2 rounded font-semibold text-navy-900 hover:bg-gold-600 transition"
              >
                Salvar Serviço
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
