import { useState, useEffect } from 'react';
import {StyleSheet,Text,View,Image,TouchableOpacity,ScrollView} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../services/firebase';
import usePartyPlayers from '../hooks/usePartyPlayers';
import { doc, onSnapshot } from 'firebase/firestore';

export default function WhoAmI({ navigation, route }) {
  const { code } = route.params;

  const { activePlayers } = usePartyPlayers(code);
  const currentUid = auth.currentUser?.uid;

  // ESTADOS CORRECTOS
  const [characters, setCharacters] = useState([]);
  const [myCharacter, setMyCharacter] = useState(null);
  const [selected, setSelected] = useState(null);

  // ESCUCHAR POOL DE PERSONAJES
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'parties', code), (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
      setCharacters(data.charactersPool || []);
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
    setSelected(char.name);
  };

  const handleGuess = () => {
    if (!selected) return;
    console.log("Selected character:", selected);
  };

  const characterImages = {
    "Mario": require('../Imagenes/whoCharacters/mario.png'),
    "Luigi": require('../Imagenes/whoCharacters/luigi.png'),
    "Peach": require('../Imagenes/whoCharacters/peach.png'),
    "Bowser": require('../Imagenes/whoCharacters/bowser.png'),
    "Yoshi": require('../Imagenes/whoCharacters/yoshi.png'),
    "Toad": require('../Imagenes/whoCharacters/toad.png'),
    };

  return (
    <View style={styles.container}>

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
                selected === char.name && styles.selectedCard
              ]}
              onPress={() => handleSelect(char)}
            >
              <Image source={characterImages[char.name] || require('../Imagenes/who.png')}style={styles.imagePlaceholder}/>

              <Text style={styles.cardText}>
                {char.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BOTÓN */}
        <TouchableOpacity
          style={[
            styles.guessButton,
            !selected && { opacity: 0.5 }
          ]}
          onPress={handleGuess}
          disabled={!selected}
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
    marginVertical: 10
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