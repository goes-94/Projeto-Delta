"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { UserPlus, MoreVertical, Mail, Phone, Clock } from "lucide-react";

export default function EquipePage() {
  const [membros, setMembros] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [novoMembro, setNovoMembro] = useState({
    nome: "",
    cargo: "",
    status: "Disponível",
    email: "",
    telefone: "",
    horarios: [], // para simplificar, pode ser array de strings
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "membros"), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembros(lista);
    });
    return () => unsubscribe();
  }, []);

  async function salvarMembro(e) {
    e.preventDefault();
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
  }

  function abrirEmail(email) {
    window.open(`mailto:${email}`, "_blank");
  }

  function abrirWhatsApp(telefone) {
    // Adaptar para DDI e formato correto do número
    const numeroFormatado = telefone.replace(/\D/g, "");
    window.open(`https://wa.me/${numeroFormatado}`, "_blank");
  }

  // Exemplo simples de popup com horários
  function visualizarHorarios(horarios) {
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

      {/* Grid de membros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {membros.map((membro) => (
          <div key={membro.id} className="bg-navy-900 border border-navy-800 p-6 rounded-xl hover:border-gold-500/50 transition-all group">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-navy-800 rounded-full flex items-center justify-center text-gold-500 font-bold border border-navy-700">
                {membro.nome.split(" ").map(n => n[0]).join("").toUpperCase()}
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
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                membro.status === "Disponível" ? "bg-green-900/30 text-green-400" : "bg-orange-900/30 text-orange-400"
              }`}>
                {membro.status}
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-navy-800 flex justify-between text-slate-500">
              <Mail size={18} className="hover:text-gold-500 cursor-pointer" onClick={() => abrirEmail(membro.email)} />
              <Phone size={18} className="hover:text-gold-500 cursor-pointer" onClick={() => abrirWhatsApp(membro.telefone)} />
              <Clock size={18} className="hover:text-gold-500 cursor-pointer" onClick={() => visualizarHorarios(membro.horarios)} />
            </div>
          </div>
        ))}
      </div>

      {/* Modal simples para adicionar membro */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-navy-900 p-6 rounded-lg w-full max-w-md relative">
            <button
              onClick={() => setModalAberto(false)}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white font-bold"
            >X</button>

            <h2 className="text-xl font-bold mb-4 text-white">Adicionar Membro</h2>

            <form onSubmit={salvarMembro} className="space-y-4">
              <input
                type="text"
                placeholder="Nome"
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white"
                value={novoMembro.nome}
                onChange={e => setNovoMembro({...novoMembro, nome: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Cargo"
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white"
                value={novoMembro.cargo}
                onChange={e => setNovoMembro({...novoMembro, cargo: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white"
                value={novoMembro.email}
                onChange={e => setNovoMembro({...novoMembro, email: e.target.value})}
                required
              />
              <input
                type="tel"
                placeholder="Telefone"
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white"
                value={novoMembro.telefone}
                onChange={e => setNovoMembro({...novoMembro, telefone: e.target.value})}
                required
              />
              <select
                value={novoMembro.status}
                onChange={e => setNovoMembro({...novoMembro, status: e.target.value})}
                className="w-full p-2 rounded bg-navy-800 border border-navy-700 text-white"
                required
              >
                <option>Disponível</option>
                <option>Em atendimento</option>
                <option>Ausente</option>
              </select>

              {/* Para simplificar, horários sem input no demo */}

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
