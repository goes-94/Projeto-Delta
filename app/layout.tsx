import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="bg-[#0a0f1e] text-white">
        <div className="flex min-h-screen">
          {/* Sidebar fixa */}
          <Sidebar />
          
          {/* Conteúdo principal expandido */}
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
