"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/(admin)/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Se a rota começar com /portal ou for /login, este layout NÃO deve interferir em nada!
  const isPublicRoute = pathname.startsWith("/portal") || pathname === "/login";

  useEffect(() => {
    // Se for rota pública, não faz nada
    if (isPublicRoute) return;

    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, isPublicRoute, router]);

  // Se for rota pública, renderiza o conteúdo direto sem travas de admin
  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-gold-500">
        Carregando Tech Lion...
      </div>
    );
  }

  if (!user) return null;

  // Painel Administrativo com Sidebar (apenas para rotas protegidas)
  return (
    <div className="flex min-h-screen bg-[#0a0f1e] text-white">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}