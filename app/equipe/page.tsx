"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { UserPlus, MoreVertical, Mail, Phone, Clock } from "lucide-react";

interface Membro {
  id: string;
  nome: string;
  cargo: string;
  status: string;
  email: string;
  telefone: string;
  horarios: string[];
}

export default function EquipePage() {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [modalAberto, setModalAberto] = useState(false);

  const [novoMembro, setNovoMembro] = useState<Omit<Membro, "id">>({
    nome: "",
    cargo: "",
    status: "Disponível",
    email: "",
    telefone: "",
    horarios: [],
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "membros"), (snapshot) => {
      const lista: Membro[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome || "",
        cargo: doc.data().cargo || "",
        status: doc.data().status || "Disponível",
        email: doc.data().email || "",
        telefone: doc.data().telefone || "",
        horarios: doc.data().horarios || [],
      }));
      setMembros(lista);
    });
    return () => unsubscribe();
  }, []);

  async function salvarMembro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await addDoc(collection(db, "membros"), novoMembro);
      setModalAberto(false);
      setNovoMembro({
        nome: "",
        cargo: "",
        status: "Disponível",
        email: "",
        telefone: "",
        horarios: [],
      });
    } catch (error) {
      console.error("Erro ao salvar membro:", error);
      // Você pode adicionar exibição de mensagem de erro para usuário aqui
    }
  }

  function abrirEmail(email: string) {
    if (email) window.open(`mailto:${email}`, "_blank");
  }

  function abrirWhatsApp(telefone: string) {
    if (telefone) {
      const numeroFormatado = telefone.replace(/\D/g, "");
      window.open(`https://wa.me/${numeroFormatado}`, "_blank");
    }
  }

  function visualizarHorarios(horarios: string[]) {
    alert("Horários disponíveis:\n" + horarios.join("\n"));
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Equipe</h1>
          <p className="text-slate-400">Gerenciamento de colaboradores e escalas</p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
        >
          <UserPlus size={20} />
          Adicionar Membro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {membros.map((membro) => (
          <div
            key={membro.id}
            className="bg-navy-900 border border-navy-800 p-6 rounded-xl hover:border-gold-500/50 transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-navy-800 rounded-full flex items-center justify-center text-gold-500 font-bold border border-navy-700">
                {membro.nome
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <button className="text-slate-500 hover:text-white">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold text-white">{membro.nome}</h3>
              <p className="text-sm text-slate-400">{membro.cargo}</p>
            </div>

            <div className="mt-6 flex gap-2">
              <span
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  membro.status === "Disponível"
                    ? "bg-green-900/30 text-green-400"
                    : "bg-orange-900/30 text-orange-400"
                }`}
              >
                {membro.status}
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-navy-800 flex justify-between text-slate-500">
              <Mail
                size={18}
                className="hover:text-gold-500 cursor-pointer"
                onClick={() => abrirEmail(membro.email)}
              />
              <Phone
                size={18}
                className="hover:text-gold-500 cursor-pointer"
                onClick={() => abrirWhatsApp(membro.telefone)}
              />
              <Clock
                size={18}
                className="hover:text-gold-500 cursor-pointer"
                onClick={() => visualizarHorarios(membro.horarios)}
              />
            </div>
          </div>
        ))}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-navy-900 p-6 rounded-lg w-full max-w-md relative">
            <button
              onClick={() => setModalAberto(false)}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white font-bold"
              aria-label="Fechar modal"
            >
              X
            </button>

            <h2 className="text-xl font-bold mb-4 text-white">Adicionar Membro</h2>

            <form onSubmit={salvarMembro} className="space-y-4">
              <input
                type="text"
                placeholder="Nome"
                value={novoMembro.nome}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNovoMembro({ ...novoMembro, nome: e.target.value })
                }
                required
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white"
              />
              <input
                type="text"
                placeholder="Cargo"
                value={novoMembro.cargo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNovoMembro({ ...novoMembro, cargo: e.target.value })
                }
                required
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white"
              />
              <input
                type="email"
                placeholder="Email"
                value={novoMembro.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNovoMembro({ ...novoMembro, email: e.target.value })
                }
                required
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white"
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={novoMembro.telefone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNovoMembro({ ...novoMembro, telefone: e.target.value })
                }
                required
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white"
              />
              <select
                value={novoMembro.status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setNovoMembro({ ...novoMembro, status: e.target.value })
                }
                required
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white"
              >
                <option>Disponível</option>
                <option>Em atendimento</option>
                <option>Ausente</option>
              </select>

              <button
                type="submit"
                className="bg-gold-500 w-full py-2 rounded font-semibold text-navy-900 hover:bg-gold-600 transition"
              >
                Salvar Membro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
