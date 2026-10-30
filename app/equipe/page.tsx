"use client";

import { UserPlus, MoreVertical, Mail, Phone, Clock } from "lucide-react";

export default function EquipePage() {
  // Dados de exemplo (serão substituídos pelo Supabase depois)
  const membros = [
    { id: 1, nome: "Ana Silva", cargo: "Senior Stylist", status: "Disponível", avatar: "AS" },
    { id: 2, nome: "Carlos Souza", cargo: "Colorista", status: "Em atendimento", avatar: "CS" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Equipe</h1>
          <p className="text-slate-400">Gerenciamento de colaboradores e escalas</p>
        </div>
        <button className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all">
          <UserPlus size={20} />
          Adicionar Membro
        </button>
      </div>

      {/* Grid de Cards da Equipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {membros.map((membro) => (
          <div key={membro.id} className="bg-navy-900 border border-navy-800 p-6 rounded-xl hover:border-gold-500/50 transition-all group">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-navy-800 rounded-full flex items-center justify-center text-gold-500 font-bold border border-navy-700">
                {membro.avatar}
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
              <Mail size={18} className="hover:text-gold-500 cursor-pointer" />
              <Phone size={18} className="hover:text-gold-500 cursor-pointer" />
              <Clock size={18} className="hover:text-gold-500 cursor-pointer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
