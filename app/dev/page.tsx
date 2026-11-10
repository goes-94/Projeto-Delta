"use client";

import { addDoc, collection, Timestamp }
from "firebase/firestore";

import { db }
from "../../firebaseConfig";

export default function DevPage() {

  async function criarColecoes() {

    await addDoc(
      collection(db, "slots"),
      {
        data: Timestamp.now(),
        hora: "09:00",
        ocupado: false,
      }
    );

    await addDoc(
      collection(db, "avaliacoes"),
      {
        cliente: "Teste",
        nota: 5,
        comentario: "Primeira avaliação",
        data: Timestamp.now(),
      }
    );

    console.log(
      "Coleções criadas"
    );
  }

  return (
    <button
      onClick={criarColecoes}
    >
      Criar coleções
    </button>
  );
}