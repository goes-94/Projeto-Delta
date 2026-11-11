"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
  getDocs,
} from "firebase/firestore";

export default function CalendarioPage() {
  const router = useRouter();

  const [membros, setMembros] = useState<
    { id: string; nome: string }[]
  >([]);

  const [form, setForm] = useState({
    cliente: "",
    servico: "",
    membro: "",
    membroId:"",
    data: "",
    horario: "",
    valor: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarMembros() {
      try {
        const snapshot = await getDocs(
          collection(db, "membros")
        );

        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          nome: doc.data().nome || "",
        }));

        setMembros(lista);
      } catch (error) {
        console.error(
          "Erro ao carregar membros:",
          error
        );
      }
    }

    carregarMembros();
  }, []);

  async function salvarAgendamento(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const [ano, mes, dia] = form.data
        .split("-")
        .map(Number);

      const dataTimestamp = Timestamp.fromDate(
        new Date(
          ano,
          mes - 1,
          dia,
          12,
          0,
          0
        )
      );

      await addDoc(collection(db, "agendamentos"), {
        cliente: form.cliente,
        servico: form.servico,
        membro: form.membro,
        membroId: form.membroId,
        data: dataTimestamp,
        horario: form.horario,
        valor: Number(form.valor),
        status: "pendente",
        criadoEm: serverTimestamp(),
      });

      router.push("/agendamentos");
    } catch (err) {
      console.error(err);

      setError(
        "Erro ao salvar o agendamento. Tente novamente."
      );

      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <div className="p-8 max-w-md mx-auto bg-navy-900 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6">
        Novo Agendamento
      </h1>

      <form
        onSubmit={salvarAgendamento}
        className="space-y-4"
      >
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

        <select
        value={form.membroId}
        onChange={(e) => {
            const membroSelecionado =
            membros.find(
                (m) => m.id === e.target.value
            );

            if (!membroSelecionado) return;

            setForm({
            ...form,
            membroId: membroSelecionado.id,
            membro: membroSelecionado.nome,
            });
        }}
        required
        className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white"
        >
        <option value="" className="text-slate-500">
            Selecione um membro
        </option>

        {membros.map((membro) => (
            <option
            key={membro.id}
            value={membro.id}
            >
            {membro.nome}
            </option>
        ))}
        </select>

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
          min="0"
          step="0.01"
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

        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-gold-500 w-full py-2 rounded font-semibold text-navy-900 hover:bg-gold-600 transition disabled:opacity-70"
        >
          {loading
            ? "Salvando..."
            : "Salvar Agendamento"}
        </button>
      </form>
    </div>
  );
}