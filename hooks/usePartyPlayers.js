import { useState, useEffect } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function usePartyPlayers(code) {
  const [activePlayers, setActivePlayers] = useState([]);

  useEffect(() => {
    if (!code) return;

    const partyRef = doc(db, "parties", code);

    const unsubscribe = onSnapshot(partyRef, async (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      const members = data.members || [];
      const host = data.host;

      const playersData = await Promise.all(
        members.map(async (uid) => {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            return {
              uid,
              username: userSnap.data().username,
              isHost: uid === host
            };
          }
          return null;
        })
      );

      setActivePlayers(playersData.filter(p => p !== null));
    });

    return () => unsubscribe();
  }, [code]);

  return { activePlayers };
}