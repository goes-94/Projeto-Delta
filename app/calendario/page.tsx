// app/calendario/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";

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
      // Converte string data para Timestamp
      const dataTimestamp = Timestamp.fromDate(new Date(form.data));

      await addDoc(collection(db, "agendamentos"), {
        cliente: form.cliente,
        servico: form.servico,
        data: dataTimestamp,
        horario: form.horario,
        valor: Number(form.valor),
        status: "pendente",
        criadoEm: serverTimestamp(),
      });
      router.push("/agendamentos");
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
        {/* inputs semelhantes, só garanta "name" idênticos */}
        {/* Inclua todos os inputs como no seu código */}
      </form>
    </div>
  );
}
