import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export async function registrarTentativaFraude(tipo: string, detalhes: string, userId: string) {
  await addDoc(collection(db, 'fraude_logs'), {
    tipo,
    detalhes,
    userId,
    data: new Date().toISOString()
  });
}

// Exemplo de uso:
// Se detectar IP/email/SteamID repetido:
// await registrarTentativaFraude('multi-conta', 'IP duplicado detectado', userId);
// No painel admin, exibir alertas de fraude para análise manual. 