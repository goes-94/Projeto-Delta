"use client";

import { useState } from "react";

export default function ConfiguracoesPage() {
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("TechLion Barbearia");
  const [emailContato, setEmailContato] = useState("contato@techlion.com");
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [temaEscuro, setTemaEscuro] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-slate-400">Personalize as principais opções do seu portal</p>
      </div>

      <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl max-w-3xl">
        <h3 className="text-white font-semibold mb-6">Informações do Estabelecimento</h3>

        <label className="block mb-4">
          <span className="text-slate-400 text-sm">Nome do Estabelecimento</span>
          <input
            type="text"
            value={nomeEstabelecimento}
            onChange={(e) => setNomeEstabelecimento(e.target.value)}
            className="mt-1 block w-full rounded-md bg-navy-800 border border-navy-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </label>

        <label className="block mb-6">
          <span className="text-slate-400 text-sm">Email de Contato</span>
          <input
            type="email"
            value={emailContato}
            onChange={(e) => setEmailContato(e.target.value)}
            className="mt-1 block w-full rounded-md bg-navy-800 border border-navy-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </label>

        <div className="flex items-center gap-3 mb-6">
          <input
            id="notificacoes"
            type="checkbox"
            checked={notificacoesAtivas}
            onChange={() => setNotificacoesAtivas(!notificacoesAtivas)}
            className="w-5 h-5 rounded bg-navy-800 border border-navy-700 text-gold-500 focus:ring-0"
          />
          <label htmlFor="notificacoes" className="text-white select-none">
            Receber notificações por email
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="tema"
            type="checkbox"
            checked={temaEscuro}
            onChange={() => setTemaEscuro(!temaEscuro)}
            className="w-5 h-5 rounded bg-navy-800 border border-navy-700 text-gold-500 focus:ring-0"
          />
          <label htmlFor="tema" className="text-white select-none">
            Tema escuro
          </label>
        </div>

        <button
          className="mt-8 bg-gold-500 text-navy-900 font-bold py-3 px-6 rounded-lg hover:bg-gold-600 transition-colors"
          onClick={() => alert("Configurações salvas!")}
        >
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}
