import { useState, useEffect } from 'react';
import {StyleSheet,Text,View,Image,TouchableOpacity,ScrollView,Modal} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../services/firebase';
import usePartyPlayers from '../hooks/usePartyPlayers';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { characterImages } from '../data/characterImages';
import { useIsFocused } from '@react-navigation/native';

export default function WhoAmI({ navigation, route }) {
  const { code } = route.params;

  const { activePlayers } = usePartyPlayers(code);
  const currentUid = auth.currentUser?.uid;
  const currentPlayer = activePlayers.find(p => p.uid === currentUid);
  const isHost = currentPlayer?.isHost;

  const [gameState, setGameState] = useState(null);
  const [hasNavigated, setHasNavigated] = useState(false);
  const isFocused = useIsFocused();

  // RESETEAR NAVEGACIÓN SI SALGO DEL JUEGO
  useEffect(() => {
    if (!gameState) {
      setHasNavigated(false);
    }
  }, [gameState]);

  // ESTADOS CORRECTOS
  const [characters, setCharacters] = useState([]);
  const [myCharacter, setMyCharacter] = useState(null);
  const [discarded, setDiscarded] = useState([]);

  // ESCUCHAR POOL DE PERSONAJES
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'parties', code), (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
      setCharacters(data.charactersPool || []);
      setGameState(data.gameState || null);
    });

    return unsub;
  }, [code]);

  // ESCUCHAR MI PERSONAJE
  useEffect(() => {
    if (!currentUid) return;

    const unsub = onSnapshot(
      doc(db, 'parties', code, 'players', currentUid),
      (snap) => {
        if (!snap.exists()) return;

        const data = snap.data();
        setMyCharacter(data.character || null);
      }
    );

    return unsub;
  }, [code, currentUid]);

  const handleSelect = (char) => {
    setDiscarded((prev) => {
      if (prev.includes(char.name)) {
        // ya estaba → quitarlo
        return prev.filter(name => name !== char.name);
      } else {
        return [...prev, char.name];
      }
    });
  };

  const handleGuess = async () => {
    if (gameState?.isGuessing) return;

    await updateDoc(doc(db, 'parties', code), {
      gameState: {
        isGuessing: true,
        guessingPlayer: currentUid,
        votes: {},
        finished: false,
      },
    });
  };

  const vote = async (value) => {
    if (currentUid === gameState?.guessingPlayer) return;
    if (gameState?.votes?.[currentUid] !== undefined) return;

    await updateDoc(doc(db, 'parties', code), {
      [`gameState.votes.${currentUid}`]: value,
    });
  };

  useEffect(() => {
    const finishVoting = async () => {
      if (!gameState || !gameState.isGuessing || gameState.finished) return;

      const votes = gameState.votes || {};
      const totalPlayers = activePlayers.length - 1;

      if (Object.keys(votes).length === totalPlayers && totalPlayers > 0) {
        const values = Object.values(votes);

        const yes = values.filter(v => v).length;
        const no = values.filter(v => !v).length;

        const result = yes > no;

        await updateDoc(doc(db, 'parties', code), {
          gameState: {
            ...gameState,
            finished: true,
            winner: result ? gameState.guessingPlayer : null,
            loser: !result ? gameState.guessingPlayer : null,
          }
        });
      }
    };

    finishVoting();
  }, [gameState, activePlayers]);

  const guessingPlayer = activePlayers.find(
    p => p.uid === gameState?.guessingPlayer
  );

  useEffect(() => {
    if (!gameState?.finished || !isHost) return;

    const timeout = setTimeout(async () => {
      if (gameState.winner) {
        await updateDoc(doc(db, 'parties', code), {
          status: 'waiting',
          game: null,
          gameState: null,
        });
      } else {
        await updateDoc(doc(db, 'parties', code), {
          gameState: null
        });
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [gameState, isHost]);

  useEffect(() => {
    if (!isFocused) return;
    if (gameState?.finished && gameState?.winner && !hasNavigated) {
      setHasNavigated(true);

      const timeout = setTimeout(() => {
        navigation.replace('gameSelection', { code });
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [gameState, hasNavigated, isFocused, navigation, code]);

  return (
    <View style={styles.container}>
      {/* MODAL DE ESPERA DE VOTOS */}
      {gameState?.isGuessing &&
        !gameState?.finished &&
        gameState.guessingPlayer === currentUid && (
          <Modal transparent animationType="fade">
            <View style={{
              flex:1,
              justifyContent:'center',
              alignItems:'center',
              backgroundColor:'rgba(0,0,0,0.7)'
            }}>
              <View style={{
                backgroundColor:'white',
                padding:20,
                borderRadius:10,
                alignItems:'center'
              }}>
                <Text style={{fontSize:18, fontWeight:'bold'}}>
                  Waiting for votes...
                </Text>
              </View>
            </View>
          </Modal>
        )}

      {/* Modal para que el jugador adivine */}
      {gameState?.isGuessing &&
        !gameState?.finished &&
        gameState.guessingPlayer !== currentUid && (
          <Modal transparent animationType="fade">
            <View style={{
              flex:1,
              backgroundColor:'rgba(0,0,0,0.7)',
              justifyContent:'center',
              alignItems:'center'
            }}>
              <View style={{
                backgroundColor:'white',
                padding:20,
                borderRadius:10,
                alignItems:'center'
              }}>
                <Text style={{fontWeight:'bold', fontSize:16}}>
                  {guessingPlayer?.username || 'Player'} is guessing...
                </Text>

                <Text style={{marginVertical:10}}>
                  Vote if {guessingPlayer?.username || 'this player'} is correct
                </Text>

                <View style={{flexDirection:'row'}}>
                  <TouchableOpacity onPress={() => vote(true)} style={{margin:10}}>
                    <Text style={{fontSize:30}}>✔️</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => vote(false)} style={{margin:10}}>
                    <Text style={{fontSize:30}}>❌</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Modal de resultados */}
        {gameState?.finished && (
          <Modal transparent animationType="fade">
            <View style={{
              flex:1,
              justifyContent:'center',
              alignItems:'center',
              backgroundColor:'rgba(0,0,0,0.7)'
            }}>
              <View style={{backgroundColor:'white', padding:20, borderRadius:10}}>
                <Text style={{fontSize:18, fontWeight:'bold'}}>
                  {gameState.winner
                    ? `${guessingPlayer?.username} has won!`
                    : `${guessingPlayer?.username} guessed wrong!`}
                </Text>
              </View>
            </View>
          </Modal>
        )}
      {/* BACK */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={26} color="white" />
      </TouchableOpacity>

      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require('../Imagenes/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Who Am I?</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* PLAYERS */}
        <View style={styles.playersContainer}>
          <Text style={styles.playersTitle}>Players</Text>

          {activePlayers.map((player) => (
            <Text
              key={player.uid}
              style={[
                styles.playerName,
                player.uid === currentUid && styles.currentPlayer
              ]}
            >
              {player.username}
              {player.uid === currentUid ? " (You)" : ""}
            </Text>
          ))}
        </View>

        {/* TU PERSONAJE */}
        {myCharacter && (
          <View style={styles.myCharacterBox}>
            <Text style={styles.myCharacterTitle}>
              Your Character
            </Text>

            <Image source={characterImages[myCharacter.name]} style={styles.myCharacterImage}/>

            <Text style={styles.myCharacterName}>
              {myCharacter.name}
            </Text>
          </View>
        )}

        {/* GRID */}
        <View style={styles.grid}>
          {characters.map((char, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                discarded.includes(char.name) && styles.discardedCard
              ]}
              onPress={() => handleSelect(char)}
            >
              <Image
                source={
                  characterImages[char.name] ||
                  require('../Imagenes/who.png')
                }
                style={styles.imagePlaceholder}
              />

              <Text style={styles.cardText}>
                {char.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BOTÓN */}
        <TouchableOpacity
          style={[styles.guessButton, gameState?.isGuessing && { opacity: 0.5 }]}
          onPress={handleGuess}
          disabled={gameState?.isGuessing}
        >
          <Text style={styles.guessText}>Guess</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: '#ffffff20',
    padding: 8,
    borderRadius: 50,
  },

  header: {
    width: '100%',
    alignItems: 'center',
    marginTop: 55,
    marginBottom: 10,
  },

  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: -10,
  },

  title: {
    color: '#34D36E',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: -30,
  },

  scrollContent: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 40,
  },

  playersContainer: {
    width: '90%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
  },

  playersTitle: {
    color: '#5FBA80',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  playerName: {
    color: 'white',
    fontSize: 14,
  },

  currentPlayer: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },

  myCharacterBox: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    width: '90%',
    alignItems: 'center'
  },

  myCharacterTitle: {
    color: '#5FBA80',
    fontWeight: 'bold'
  },

  myCharacterImage: {
    width: 120,
    height: 120,
    backgroundColor: '#374151',
    borderRadius: 10,
    marginVertical: 10,
    resizeMode: 'contain'
  },

  myCharacterName: {
    color: 'white',
    fontWeight: 'bold'
  },

  grid: {
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  discardedCard: {
    borderWidth: 2,
    borderColor: '#FF4C4C',
    opacity: 0.3,
  },

  card: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: '#1E293B', 
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: '#34D36E',
  },

  imagePlaceholder: {
    width: '100%',
    height: '70%',
    backgroundColor: '#374151',
    borderRadius: 8,
    resizeMode: 'contain',
  },

  cardText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },

  guessButton: {
    marginTop: 25,
    width: 150,
    height: 50,
    backgroundColor: '#33A548',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  guessText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});