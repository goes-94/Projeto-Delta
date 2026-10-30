"use client"; // Necessário por causa dos ícones e interatividade

import Link from "next/link";
import { usePathname } from "next/navigation"; // Para destacar o botão ativo
import { LayoutDashboard, Calendar, Users, Scissors, BarChart3, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname(); // Pega a URL atual para marcar o link como ativo

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Agendamentos", path: "/agendamentos", icon: Calendar },
    { name: "Equipe", path: "/equipe", icon: Users },
    { name: "Serviços", path: "/servicos", icon: Scissors },
    { name: "Relatórios", path: "/relatorios", icon: BarChart3 },
    { name: "Configurações", path: "/configuracoes", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-800 h-screen p-6">
      <h1 className="text-2xl font-bold text-gold-500 mb-10">TECH<span className="text-white">LION</span></h1>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive 
                  ? "bg-gold-500 text-navy-900 font-bold" 
                  : "text-slate-400 hover:bg-navy-800 hover:text-white"
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
