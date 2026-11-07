"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CalendarioPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    cliente: "",
    servico: "",
    data: "",
    horario: "",
    valor: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function salvarAgendamento(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, "agendamentos"), {
        cliente: form.cliente,
        servico: form.servico,
        data: form.data,
        horario: form.horario,
        valor: Number(form.valor),      // converte para number aqui
        status: "pendente",
        criadoEm: serverTimestamp(),
      });
      router.push("/agendamentos"); // volta para a lista após salvar
    } catch (err) {
      setError("Erro ao salvar o agendamento. Tente novamente.");
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="p-8 max-w-md mx-auto bg-navy-900 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Novo Agendamento</h1>

      <form onSubmit={salvarAgendamento} className="space-y-4">
        <input
          name="cliente"
          type="text"
          placeholder="Nome do cliente"
          value={form.cliente}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
        <input
          name="servico"
          type="text"
          placeholder="Serviço"
          value={form.servico}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
        <input
          name="data"
          type="date"
          value={form.data}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
        <input
          name="valor"
          type="number"
          placeholder="Valor"
          value={form.valor}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
        <input
          name="horario"
          type="time"
          value={form.horario}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
        />

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-gold-500 w-full py-2 rounded font-semibold text-navy-900 hover:bg-gold-600 transition disabled:opacity-70"
        >
          {loading ? "Salvando..." : "Salvar Agendamento"}
        </button>
      </form>
    </div>
  );
}
