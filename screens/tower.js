import { useState, useEffect } from 'react';
import {StyleSheet,Text,View,Image,TouchableOpacity,ScrollView,TextInput,Modal} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../services/firebase';
import usePartyPlayers from '../hooks/usePartyPlayers';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export default function TowerOfNerds({ navigation, route }) {
  const { code } = route.params;
  const { activePlayers } = usePartyPlayers(code);

  const currentUid = auth.currentUser?.uid;

  const [tower, setTower] = useState(['', '', '', '', '', '']);
  const [gameState, setGameState] = useState(null);

  const updateTowerItem = (text, index) => {
    const updatedTower = [...tower];
    updatedTower[index] = text;
    setTower(updatedTower);
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'parties', code), (snap) => {
      if (!snap.exists()) return;
      setGameState(snap.data().gameState || null);
    });

    return unsub;
  }, [code]);

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
    if (!gameState || !gameState.isGuessing || gameState.finished) return;

    const votes = gameState.votes || {};
    const totalPlayers = activePlayers.length - 1;

    if (Object.keys(votes).length === totalPlayers && totalPlayers > 0) {
      const values = Object.values(votes);

      const yes = values.filter(v => v).length;
      const no = values.filter(v => !v).length;

      const result = yes > no;

      updateDoc(doc(db, 'parties', code), {
        gameState: {
          ...gameState,
          finished: true,
          winner: result ? gameState.guessingPlayer : null,
          loser: !result ? gameState.guessingPlayer : null,
        }
      });
    }
  }, [gameState, activePlayers]);

  const guessingPlayer = activePlayers.find(
    p => p.uid === gameState?.guessingPlayer
  );

  useEffect(() => {
    if (!gameState?.finished) return;

    const timeout = setTimeout(() => {
      updateDoc(doc(db, 'parties', code), {
        gameState: null
      });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [gameState]);

  return (
    <View style={styles.container}>

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
                  Vote if he is right or wrong
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
                  : 'Wrong guess!'}
              </Text>
            </View>
          </View>
        </Modal>
      )}

      {/* UI ORIGINAL */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={26} color="white" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Image
          source={require('../Imagenes/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Tower of Nerds</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.playersContainer}>
          <View style={styles.playersHeader}>
            <Text style={styles.headerText}>Name</Text>
            <Text style={styles.headerText}>Category</Text>
          </View>

          {activePlayers.map((player) => (
            <View key={player.uid} style={styles.playerRow}>
              
              <Text
                style={[
                  styles.playerName,
                  player.uid === currentUid && styles.currentPlayer,
                  player.eliminated && { color: 'red' } 
                ]}
              >
                {player.username}
                {player.uid === currentUid ? ' (You)' : ''}
              </Text>

              <Text style={styles.playerCategory}>
                {player.eliminated
                  ? player.category 
                  : player.uid === currentUid
                    ? '????'
                    : player.category || '....'}
              </Text>

            </View>
          ))}
        </View>

        <View style={styles.tower}>
          {tower.map((item, index) => (
            <TextInput
              key={index}
              style={styles.towerInput}
              placeholder={`Character ${index + 1}`}
              value={item}
              onChangeText={(text) => updateTowerItem(text, index)}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleGuess} style={[styles.guessButton,gameState?.isGuessing && { opacity: 0.5 }]}
          disabled={gameState?.isGuessing}>
          <Text>Guess</Text>
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
    marginTop: -5,
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
    marginBottom: 25,
  },

  playersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff20',
  },

  headerText: {
    color: '#5FBA80',
    fontSize: 15,
    fontWeight: 'bold',
    width: '48%',
  },

  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  playerName: {
    color: 'white',
    fontSize: 14,
    width: '48%',
  },

  currentPlayer: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },

  playerCategory: {
    color: '#C2C6CE',
    fontSize: 14,
    width: '48%',
  },

  towerContainer: {
    width: '90%',
    alignItems: 'center',
  },

  towerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  tower: {
    width: '75%',
  },

  towerInput: {
    width: 200,
    height: 50,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: 'bold',
  },

  guessButton: {
    marginTop: 30,
    width: 130,
    height: 45,
    backgroundColor: '#33A548',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  guessButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});