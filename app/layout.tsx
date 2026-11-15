"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { AuthProvider, useAuth } from "@/app/context/AuthContext";

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Verifica se o usuário já está na página de login para evitar loop infinito
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push("/login"); // 👈 Redireciona para a sua página de login
    }
  }, [user, loading, isLoginPage, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-gold-500">
        Carregando Tech Lion...
      </div>
    );
  }

  // Se for a página de login ou o usuário não estiver logado, exibe apenas o conteúdo da página (ex: a tela de login)
  if (!user || isLoginPage) {
    return <>{children}</>;
  }

  // Se estiver logado, exibe a Sidebar e o painel normalmente
  return (
    <div className="flex min-h-screen bg-[#0a0f1e] text-white">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="bg-[#0a0f1e] text-white">
        <AuthProvider>
          <MainLayoutContent>
            {children}
          </MainLayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}