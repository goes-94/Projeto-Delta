"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebaseConfig"; // Ajuste o caminho se necessário para o seu arquivo firebaseConfig
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      router.push("/"); // Redireciona para o Dashboard após logar com sucesso
    } catch (err: any) {
      console.error(err);
      setErro("E-mail ou senha inválidos. Verifique seus dados.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4">
      <div className="max-w-md w-full bg-navy-900 border border-navy-800 p-8 rounded-xl shadow-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gold-500 tracking-wider">TECH<span className="text-white">LION</span></h1>
          <p className="text-sm text-slate-400 mt-1">Acesse sua conta para gerenciar o sistema</p>
        </div>

        {erro && (
          <div className="bg-red-950/50 border border-red-700/50 text-red-300 p-3 rounded-lg text-sm text-center">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-navy-800 border border-navy-700 text-white focus:border-gold-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-navy-800 border border-navy-700 text-white focus:border-gold-500 outline-none text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold py-2.5 rounded-lg transition-all disabled:opacity-50 shadow-md"
          >
            {carregando ? "Entrando..." : "Entrar no Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}