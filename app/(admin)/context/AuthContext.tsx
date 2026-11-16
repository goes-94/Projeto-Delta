"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // 🛡️ Se estivermos no Portal ou na página de login, NUNCA redireciona
      const isPublicRoute = pathname === "/login" || pathname?.startsWith("/portal");

      if (isPublicRoute) return;

      // Se o usuário NÃO estiver logado e tentar acessar uma rota protegida (admin)
      if (!currentUser) {
        router.push("/login");
      }
      
      // Se estiver logado e tentar ir para /login, joga direto para o Dashboard
      if (currentUser && pathname === "/login") {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);