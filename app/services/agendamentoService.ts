// services/agendamentoService.ts
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";  // ajuste o caminho relativo

export async function criarAgendamento(agendamento: any) {
  try {
    await addDoc(collection(db, "agendamentos"), {
      ...agendamento,
      status: "pendente",
      criadoEm: serverTimestamp(),
    });
    console.log("Agendamento criado com sucesso!");
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    throw error; // para tratar erros no componente que chamar a função
  }
}
