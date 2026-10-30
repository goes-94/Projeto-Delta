"use client";

export default function RelatoriosPage() {
  const faturamentoSemanal = [
    { dia: "Seg", valor: 400, percent: 30 },
    { dia: "Ter", valor: 600, percent: 45 },
    { dia: "Qua", valor: 800, percent: 60 },
    { dia: "Qui", valor: 500, percent: 40 },
    { dia: "Sex", valor: 1200, percent: 85 },
    { dia: "Sáb", valor: 1500, percent: 100 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        <p className="text-slate-400">Visão consolidada de desempenho</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl">
          <p className="text-slate-400 text-sm">Receita Mensal</p>
          <h3 className="text-2xl font-bold text-white mt-1">R$ 24.500</h3>
        </div>
        <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl">
          <p className="text-slate-400 text-sm">Ticket Médio</p>
          <h3 className="text-2xl font-bold text-white mt-1">R$ 145</h3>
        </div>
        <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl">
          <p className="text-slate-400 text-sm">Agendamentos</p>
          <h3 className="text-2xl font-bold text-white mt-1">184</h3>
        </div>
      </div>

      {/* Relatório Visual Nativo (Sem dependências) */}
      <div className="bg-navy-900 border border-navy-800 p-8 rounded-xl">
        <h3 className="text-white font-semibold mb-8">Faturamento Semanal (R$)</h3>
        
        <div className="space-y-6">
          {faturamentoSemanal.map((item) => (
            <div key={item.dia} className="flex items-center gap-4">
              <span className="w-10 text-sm text-slate-400 font-medium">{item.dia}</span>
              <div className="flex-1 h-4 bg-navy-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold-500 rounded-full transition-all duration-500" 
                  style={{ width: `${item.percent}%` }}
                />
              </div>
              <span className="w-20 text-right text-white font-bold text-sm">R$ {item.valor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
