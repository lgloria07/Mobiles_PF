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

    // Listener 1: party (members + host)
    const unsubscribeParty = onSnapshot(partyRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      members = data.members || [];
      host = data.host;

      updatePlayers();
    });

    // Listener 2: players (categorías en tiempo real)
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
      categoriesMap = {};

      snapshot.forEach((doc) => {
        categoriesMap[doc.id] = doc.data().category;
      });

      updatePlayers();
    });

    //Función para combinar todo
    const updatePlayers = async () => {
      if (!members.length) {
        setActivePlayers([]);
        return;
      }

      if (Object.keys(categoriesMap).length === 0) {
      }

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