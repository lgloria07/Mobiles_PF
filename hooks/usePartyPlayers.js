// CREAMOS UN HOOK PARA PODER OBTENER LOS JUGADORES ACTIVOS EN UNA PARTIDA EN CUALQUIER MOMENTO 
import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function usePartyPlayers(code) {
  const [activePlayers, setActivePlayers] = useState([]);

  useEffect(() => {
    if (!code) return;

    const partyRef = doc(db, "parties", code);
    const playersRef = collection(db, "parties", code, "players");

    let members = [];
    let host = null;
    let categoriesMap = {};

    // Obtenemos miembros y host en tiempo real
    const unsubscribeParty = onSnapshot(partyRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      members = data.members || [];
      host = data.host;

      updatePlayers();
    });

    // Obtenemos categorías de jugadores en tiempo real
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
      categoriesMap = {};

      snapshot.forEach((doc) => {
        categoriesMap[doc.id] = doc.data().category;
      });

      updatePlayers();
    });

    // Función para actualizar la lista de jugadores activos
    const updatePlayers = async () => {
      if (!members.length) {
        setActivePlayers([]);
        return;
      }

      if (Object.keys(categoriesMap).length === 0) {
      }

      // Obtenemos datos de cada jugador
      const playersData = await Promise.all(
        members.map(async (uid) => {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) return null;

          return {
            uid,
            username: userSnap.data().username,
            isHost: uid === host,
            category: categoriesMap[uid] || null
          };
        })
      );

      setActivePlayers(playersData.filter(p => p !== null));
    };

    return () => {
      unsubscribeParty();
      unsubscribePlayers();
    };

  }, [code]);

  return { activePlayers };
}