import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import {
  doc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';

import {
  useEffect,
  useState,
  useRef
} from 'react';

import { auth, db }
from '../services/firebase';

import usePartyPlayers
from '../hooks/usePartyPlayers';

import {
  getRandomCategory,
  getRandomCard
} from '../utils/tabooHelpers';

export default function Taboo({
  route,
  navigation
}) {

  const { code } = route.params;

  const { activePlayers } =
    usePartyPlayers(code);

  const currentUid =
    auth.currentUser?.uid;

  const [gameState, setGameState] =
    useState(null);

  const [localTimer, setLocalTimer] =
    useState(0);

  const intervalRef =
    useRef(null);

  const gameStateRef =
    useRef(null);

  const currentPlayer =
    activePlayers.find(
      p => p.uid === currentUid
    );

  const isHost =
    currentPlayer?.isHost;

  // FIRESTORE LISTENER
  useEffect(() => {

    const unsub = onSnapshot(
      doc(db, 'parties', code),
      (snap) => {

        if (!snap.exists()) return;

        const data = snap.data();

        setGameState(
          data.gameState || null
        );
      }
    );

    return unsub;

  }, []);

  // UPDATE REF
  useEffect(() => {

    gameStateRef.current =
      gameState;

  }, [gameState]);

  // PLAYER INFO
  const playingPlayer =
    activePlayers.find(
      p => p.uid === gameState?.currentPlayer
    );

  const isMyTurn =
    currentUid === gameState?.currentPlayer;

  // SYNC TIMER
  useEffect(() => {

    if (!gameState) return;

    if (!gameState.started) return;

    setLocalTimer(
      gameState.timer
    );

  }, [
    gameState?.currentTurn,
    gameState?.started
  ]);

  // TIMER
  useEffect(() => {

    if (!gameState) return;

    if (!gameState.started) return;

    if (gameState.finished) return;

    if (!isHost) return;

    if (intervalRef.current) return;

    intervalRef.current =
      setInterval(() => {

        setLocalTimer(prev => {

          const next =
            prev - 1;

          if (next <= 0) {

            clearInterval(
              intervalRef.current
            );

            intervalRef.current =
              null;

            endTurn();

            return 0;
          }

          return next;

        });

      }, 1000);

    return () => {

      if (intervalRef.current) {

        clearInterval(
          intervalRef.current
        );

        intervalRef.current =
          null;
      }
    };

  }, [
    gameState?.currentTurn,
    gameState?.started,
    gameState?.finished,
    isHost
  ]);

  // START TURN
  const startTurn = async () => {

    const category =
      getRandomCategory();

    const card =
      getRandomCard(category, []);

    await updateDoc(
      doc(db, 'parties', code),
      {

        gameState: {
          ...gameState,
          started: true,
          timer: 60,
          currentCategory: category,
          currentWord: card.word,
          forbiddenWords:
            card.forbidden,
          usedWords: [card.word]
        }
      }
    );
  };

  // CORRECT
  const correct = async () => {

    if (localTimer <= 0) return;

    const nextCard =
      getRandomCard(
        gameState.currentCategory,
        gameState.usedWords
      );

    await updateDoc(
      doc(db, 'parties', code),
      {

        'gameState.currentWord':
          nextCard.word,

        'gameState.forbiddenWords':
          nextCard.forbidden,

        'gameState.usedWords': [
          ...gameState.usedWords,
          nextCard.word
        ],

        [`gameState.scores.${currentUid}`]:
          (gameState.scores?.[
            currentUid
          ] || 0) + 1
      }
    );
  };

  // SKIP
  const skip = async () => {

    if (localTimer <= 0) return;

    const nextCard =
      getRandomCard(
        gameState.currentCategory,
        gameState.usedWords
      );

    await updateDoc(
      doc(db, 'parties', code),
      {

        'gameState.currentWord':
          nextCard.word,

        'gameState.forbiddenWords':
          nextCard.forbidden,

        'gameState.usedWords': [
          ...gameState.usedWords,
          nextCard.word
        ]
      }
    );
  };

  // END TURN
  const endTurn = async () => {

    const currentState =
      gameStateRef.current;

    if (!currentState) return;

    const nextTurn =
      currentState.currentTurn + 1;

    const totalTurns =
      activePlayers.length * 3;

    // FINISHED
    if (nextTurn >= totalTurns) {

      await updateDoc(
        doc(db, 'parties', code),
        {
          'gameState.finished': true
        }
      );

      return;
    }

    const nextPlayer =
      activePlayers[
        nextTurn % activePlayers.length
      ];

    await updateDoc(
      doc(db, 'parties', code),
      {

        gameState: {
          ...currentState,
          currentTurn: nextTurn,
          currentPlayer: nextPlayer.uid,
          started: false,
          timer: 60,
          currentCategory: null,
          currentWord: null,
          forbiddenWords: [],
          usedWords: []
        }
      }
    );
  };

  // EXIT
  const exitGame = async () => {

    if (intervalRef.current) {

      clearInterval(
        intervalRef.current
      );

      intervalRef.current =
        null;
    }

    if (isHost) {

      await updateDoc(
        doc(db, 'parties', code),
        {
          status: 'waiting',
          game: null,
          gameState: null
        }
      );
    }

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'gameSelection',
          params: { code }
        }
      ]
    });
  };

  // LOADING
  if (!gameState) {

    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Loading...
        </Text>
      </View>
    );
  }

  // FINAL
  if (gameState.finished) {

    const sortedPlayers =
      [...activePlayers].sort(
        (a, b) => {

          const scoreA =
            gameState.scores?.[
              a.uid
            ] || 0;

          const scoreB =
            gameState.scores?.[
              b.uid
            ] || 0;

          return scoreB - scoreA;
        }
      );

    return (
      <View style={styles.container}>

        <Text style={styles.title}>
          FINAL SCORES
        </Text>

        {sortedPlayers.map(player => (

          <View
            key={player.uid}
            style={styles.scoreRow}
          >

            <Text style={styles.scoreName}>
              {player.username}
            </Text>

            <Text style={styles.scorePoints}>
              {gameState.scores?.[
                player.uid
              ] || 0}
            </Text>

          </View>
        ))}

        <TouchableOpacity
          style={styles.readyButton}
          onPress={exitGame}
        >

          <Text style={styles.readyText}>
            EXIT
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  // WAITING
  if (!isMyTurn) {

    return (
      <View style={styles.container}>

        <Text style={styles.waiting}>
          Waiting for
        </Text>

        <Text style={styles.title}>
          {playingPlayer?.username}
        </Text>

      </View>
    );
  }

  // READY
  if (!gameState.started) {

    return (
      <View style={styles.container}>

        <Text style={styles.round}>
          ROUND {
            Math.floor(
              gameState.currentTurn /
              activePlayers.length
            ) + 1
          } OF 3
        </Text>

        <Text style={styles.title}>
          {playingPlayer?.username}
        </Text>

        <Text style={styles.passText}>
          Pass the phone!
        </Text>

        <TouchableOpacity
          style={styles.readyButton}
          onPress={startTurn}
        >

          <Text style={styles.readyText}>
            READY!
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  // PLAY SCREEN
  return (
    <View style={styles.container}>

      <Text style={styles.timer}>
        {localTimer}
      </Text>

      <Text style={styles.category}>
        {gameState.currentCategory}
      </Text>

      <View style={styles.wordCard}>

        <Text style={styles.word}>
          {gameState.currentWord}
        </Text>

        <Text style={styles.tabooTitle}>
          Forbidden words:
        </Text>

        {gameState.forbiddenWords?.map(
          (word, index) => (

            <Text
              key={index}
              style={styles.forbidden}
            >
              {word}
            </Text>
          )
        )}

      </View>

      <View style={styles.buttons}>

        <TouchableOpacity
          style={styles.skip}
          onPress={skip}
        >

          <Text style={styles.buttonEmoji}>
            ❌
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.correct}
          onPress={correct}
        >

          <Text style={styles.buttonEmoji}>
            ✔️
          </Text>

        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#14213b',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  title: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  waiting: {
    color: 'white',
    fontSize: 25,
    marginBottom: 20,
  },

  round: {
    color: 'white',
    fontSize: 25,
    marginBottom: 30,
    fontWeight: 'bold'
  },

  passText: {
    color: 'white',
    fontSize: 20,
    marginBottom: 30,
  },

  readyButton: {
    width: 250,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  readyText: {
    color: '#14213b',
    fontSize: 35,
    fontWeight: 'bold'
  },

  timer: {
    color: 'white',
    fontSize: 70,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  category: {
    color: 'white',
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold'
  },

  wordCard: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
  },

  word: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#14213b',
    marginBottom: 20,
  },

  tabooTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#863535'
  },

  forbidden: {
    fontSize: 22,
    marginBottom: 8,
    color: '#444'
  },

  buttons: {
    flexDirection: 'row',
    marginTop: 50,
  },

  skip: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },

  correct: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },

  buttonEmoji: {
    fontSize: 45,
  },

  scoreRow: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
  },

  scoreName: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  scorePoints: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#14213b'
  }
});