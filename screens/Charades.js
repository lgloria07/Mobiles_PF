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

import { auth, db } from '../services/firebase';

import usePartyPlayers from '../hooks/usePartyPlayers';

import {
  getRandomCategory,
  getRandomWord
} from '../utils/charadesHelpers';

export default function Charades({ route, navigation }) {

  const { code } = route.params;

  const { activePlayers } = usePartyPlayers(code);

  const currentUid = auth.currentUser?.uid;

  const [gameState, setGameState] = useState(null);

  const intervalRef = useRef(null);

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

        setGameState(data.gameState || null);
      }
    );

    return unsub;

  }, []);

  const playingPlayer =
    activePlayers.find(
      p => p.uid === gameState?.currentPlayer
    );

  const isMyTurn =
    currentUid === gameState?.currentPlayer;

  // TIMER
  useEffect(() => {

    if (!isHost) return;

    if (!gameState?.started) return;

    if (gameState?.finished) return;

    // PREVENT MULTIPLE INTERVALS
    if (intervalRef.current) return;

    intervalRef.current = setInterval(async () => {

      const currentTimer =
        gameState?.timer || 0;

      // END TURN
      if (currentTimer <= 1) {

        clearInterval(intervalRef.current);

        intervalRef.current = null;

        await endTurn();

        return;
      }

      await updateDoc(
        doc(db, 'parties', code),
        {
          'gameState.timer':
            currentTimer - 1
        }
      );

    }, 1000);

    return () => {

      if (intervalRef.current) {

        clearInterval(intervalRef.current);

        intervalRef.current = null;
      }
    };

  }, [
    gameState?.started,
    gameState?.finished
  ]);

  // START TURN
  const startTurn = async () => {

    const category =
      getRandomCategory();

    const word =
      getRandomWord(category, []);

    await updateDoc(
      doc(db, 'parties', code),
      {

        gameState: {
          ...gameState,
          started: true,
          timer: 2,
          currentCategory: category,
          currentWord: word,
          usedWords: [word]
        }
      }
    );
  };

  // CORRECT
  const correct = async () => {

    const nextWord =
      getRandomWord(
        gameState.currentCategory,
        gameState.usedWords
      );

    await updateDoc(
      doc(db, 'parties', code),
      {

        'gameState.currentWord':
          nextWord,

        'gameState.usedWords': [
          ...gameState.usedWords,
          nextWord
        ],

        [`gameState.scores.${currentUid}`]:
          (gameState.scores?.[currentUid] || 0) + 1
      }
    );
  };

  // SKIP
  const skip = async () => {

    const nextWord =
      getRandomWord(
        gameState.currentCategory,
        gameState.usedWords
      );

    await updateDoc(
      doc(db, 'parties', code),
      {

        'gameState.currentWord':
          nextWord,

        'gameState.usedWords': [
          ...gameState.usedWords,
          nextWord
        ]
      }
    );
  };

  // END TURN
  const endTurn = async () => {

    const nextTurn =
      gameState.currentTurn + 1;

    const totalTurns =
      activePlayers.length * 3;

    // GAME FINISHED
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
          ...gameState,
          currentTurn: nextTurn,
          currentPlayer: nextPlayer.uid,
          started: false,
          timer: 2,
          currentCategory: null,
          currentWord: null,
          usedWords: []
        }
      }
    );
  };

  // EXIT GAME
  const exitGame = async () => {

    try {

      if (intervalRef.current) {

        clearInterval(intervalRef.current);

        intervalRef.current = null;
      }

      // ONLY HOST RESETS GAME
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

    } catch (error) {

      console.log(error);
    }
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

  // FINAL SCREEN
  if (gameState.finished) {

    const sortedPlayers =
      [...activePlayers].sort((a, b) => {

        const scoreA =
          gameState.scores?.[a.uid] || 0;

        const scoreB =
          gameState.scores?.[b.uid] || 0;

        return scoreB - scoreA;
      });

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
              {gameState.scores?.[player.uid] || 0}
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

  // WAITING SCREEN
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

  // READY SCREEN
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
          Pass the phone to the player!
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
        {gameState.timer}
      </Text>

      <Text style={styles.category}>
        {gameState.currentCategory}
      </Text>

      <View style={styles.wordCard}>

        <Text style={styles.word}>
          {gameState.currentWord}
        </Text>

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
    backgroundColor: '#63A9E9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  round: {
    color: 'white',
    fontSize: 25,
    marginBottom: 30,
    fontWeight: 'bold'
  },

  title: {
    color: 'white',
    fontSize: 45,
    fontWeight: 'bold',
    marginBottom: 20,
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
    color: '#5B2C83',
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
    fontSize: 28,
    marginBottom: 40,
    fontWeight: 'bold'
  },

  wordCard: {
    width: '85%',
    height: 250,
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  word: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#5B2C83',
    textAlign: 'center'
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

  waiting: {
    color: 'white',
    fontSize: 25,
    marginBottom: 20,
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
    color: '#5B2C83'
  }
});