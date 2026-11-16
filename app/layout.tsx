import "./globals.css";
import { AuthProvider } from "@/app/(admin)/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="bg-[#0a0f1e] text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}