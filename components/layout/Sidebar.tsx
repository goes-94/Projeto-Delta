"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  CalendarDays, 
  Users, 
  Scissors, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [recolhido, setRecolhido] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Agendamentos", path: "/agendamentos", icon: Calendar },
    { name: "Agenda", path: "/agenda-semanal", icon: CalendarDays },
    { name: "Equipe", path: "/equipe", icon: Users },
    { name: "Serviços", path: "/servicos", icon: Scissors },
    { name: "Relatórios", path: "/relatorios", icon: BarChart3 },
    { name: "Configurações", path: "/configuracoes", icon: Settings },
  ];

  return (
    <aside 
      className={`relative bg-navy-900 border-r border-navy-800 h-screen transition-all duration-300 flex flex-col ${
        recolhido ? "w-20 p-4" : "w-64 p-6"
      }`}
    >
      {/* Botão flutuante na borda para recolher/expandir */}
      <button
        onClick={() => setRecolhido(!recolhido)}
        title={recolhido ? "Expandir menu" : "Recolher menu"}
        className="absolute -right-3 top-7 bg-navy-800 border border-navy-700 text-gold-500 hover:bg-gold-500 hover:text-navy-900 rounded-full p-1 transition-colors shadow-md z-10"
      >
        {recolhido ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logo adaptável */}
      <div className={`mb-10 flex items-center ${recolhido ? "justify-center" : ""}`}>
        {recolhido ? (
          <span className="text-2xl font-bold text-gold-500">
            T<span className="text-white">L</span>
          </span>
        ) : (
          <h1 className="text-2xl font-bold text-gold-500 truncate">
            TECH<span className="text-white">LION</span>
          </h1>
        )}
      </div>

      {/* Links de navegação */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              title={recolhido ? item.name : undefined}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                recolhido ? "justify-center" : "gap-3"
              } ${
                isActive
                  ? "bg-gold-500 text-navy-900 font-bold"
                  : "text-slate-400 hover:bg-navy-800 hover:text-white"
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              {!recolhido && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}