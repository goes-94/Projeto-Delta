"use client";

import { useState } from "react";
import { Settings, Store, Clock, Bell, Shield, Save } from "lucide-react";

export default function ConfiguracoesPage() {
  // Estado para armazenar as configurações da empresa
  const [config, setConfig] = useState({
    nomeEmpresa: "Tech Lion Studio",
    cnpj: "00.000.000/0001-00",
    telefone: "(11) 99999-9999",
    email: "contato@techlion.com",
    endereco: "Rua Principal, 100 - São Paulo, SP",
    horarioAbertura: "09:00",
    horarioFechamento: "20:00",
    notifWhatsapp: true,
    notifEmail: false,
  });

  const [abaAtiva, setAbaAtiva] = useState<"geral" | "horarios" | "notificacoes">("geral");
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    
    // Simulando o salvamento (você pode integrar com o Firestore depois, se desejar salvar na nuvem)
    setTimeout(() => {
      setSalvando(false);
      alert("Configurações salvas com sucesso!");
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="text-gold-500" size={28} />
            Configurações do Sistema
          </h1>
          <p className="text-slate-400">Gerencie as preferências gerais e operacionais do seu estabelecimento.</p>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex border-b border-navy-800 gap-4">
        <button
          onClick={() => setAbaAtiva("geral")}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${
            abaAtiva === "geral"
              ? "border-gold-500 text-gold-500"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Store size={18} /> Dados da Empresa
        </button>
        <button
          onClick={() => setAbaAtiva("horarios")}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${
            abaAtiva === "horarios"
              ? "border-gold-500 text-gold-500"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Clock size={18} /> Horários
        </button>
        <button
          onClick={() => setAbaAtiva("notificacoes")}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${
            abaAtiva === "notificacoes"
              ? "border-gold-500 text-gold-500"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Bell size={18} /> Notificações
        </button>
      </div>

      {/* Conteúdo do Formulário */}
      <form onSubmit={handleSubmit} className="bg-navy-900 border border-navy-800 p-6 rounded-xl space-y-6">
        
        {/* ABA 1: GERAL */}
        {abaAtiva === "geral" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Informações do Estabelecimento</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Negócio</label>
                <input
                  type="text"
                  value={config.nomeEmpresa}
                  onChange={(e) => setConfig({ ...config, nomeEmpresa: e.target.value })}
                  className="w-full p-2.5 rounded bg-navy-800 border border-navy-700 text-white focus:border-gold-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">CNPJ / CPF</label>
                <input
                  type="text"
                  value={config.cnpj}
                  onChange={(e) => setConfig({ ...config, cnpj: e.target.value })}
                  className="w-full p-2.5 rounded bg-navy-800 border border-navy-700 text-white focus:border-gold-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Telefone Comercial</label>
                <input
                  type="text"
                  value={config.telefone}
                  onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                  className="w-full p-2.5 rounded bg-navy-800 border border-navy-700 text-white focus:border-gold-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">E-mail de Contato</label>
                <input
                  type="email"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  className="w-full p-2.5 rounded bg-navy-800 border border-navy-700 text-white focus:border-gold-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Endereço Completo</label>
              <input
                type="text"
                value={config.endereco}
                onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
                className="w-full p-2.5 rounded bg-navy-800 border border-navy-700 text-white focus:border-gold-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* ABA 2: HORÁRIOS */}
        {abaAtiva === "horarios" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Expediente de Atendimento</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Horário de Abertura</label>
                <input
                  type="time"
                  value={config.horarioAbertura}
                  onChange={(e) => setConfig({ ...config, horarioAbertura: e.target.value })}
                  className="w-full p-2.5 rounded bg-navy-800 border border-navy-700 text-white focus:border-gold-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Horário de Fechamento</label>
                <input
                  type="time"
                  value={config.horarioFechamento}
                  onChange={(e) => setConfig({ ...config, horarioFechamento: e.target.value })}
                  className="w-full p-2.5 rounded bg-navy-800 border border-navy-700 text-white focus:border-gold-500 outline-none"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Estes horários servem como base para a escala e marcação de novos agendamentos.</p>
          </div>
        )}

        {/* ABA 3: NOTIFICAÇÕES */}
        {abaAtiva === "notificacoes" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Preferências de Alertas</h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-navy-800/60 border border-navy-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notifWhatsapp}
                  onChange={(e) => setConfig({ ...config, notifWhatsapp: e.target.checked })}
                  className="w-4 h-4 accent-gold-500 rounded"
                />
                <div>
                  <p className="text-sm font-medium text-white">Lembretes via WhatsApp</p>
                  <p className="text-xs text-slate-400">Enviar confirmações e lembretes automáticos para os clientes.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-navy-800/60 border border-navy-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notifEmail}
                  onChange={(e) => setConfig({ ...config, notifEmail: e.target.checked })}
                  className="w-4 h-4 accent-gold-500 rounded"
                />
                <div>
                  <p className="text-sm font-medium text-white">Notificações por E-mail</p>
                  <p className="text-xs text-slate-400">Receber relatórios diários de fechamento e comissões no e-mail.</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Botão de Salvar */}
        <div className="pt-4 border-t border-navy-800 flex justify-end">
          <button
            type="submit"
            disabled={salvando}
            className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>

      </form>
    </div>
  );
}