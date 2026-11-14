import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { AuthProvider } from "@/app/context/AuthContext"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="bg-[#0a0f1e] text-white">
        <AuthProvider>
        <div className="flex min-h-screen">
          {/* Sidebar fixa */}
          <Sidebar />
          
          {/* Conteúdo principal expandido */}
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
        </AuthProvider>
      </body>
    </html>
  );
}
