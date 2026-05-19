import { useState, useEffect } from 'react';

import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';

import { auth, db }
from '../services/firebase';

import {
  doc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';

import { Ionicons }
from '@expo/vector-icons';

import usePartyPlayers
from '../hooks/usePartyPlayers';

export default function RulesTaboo({
  navigation,
  route
}) {

  const [mensaje, setMensaje] =
    useState('');

  const { code } = route.params;

  // ACTIVE PLAYERS
  const { activePlayers } =
    usePartyPlayers(code);

  const currentUid =
    auth.currentUser?.uid;

  const currentPlayer =
    activePlayers.find(
      p => p.uid === currentUid
    );

  const isHost =
    currentPlayer?.isHost || false;

  // START GAME
  const startGame = async () => {

    try {

      const firstPlayer =
        activePlayers[0];

      await updateDoc(
        doc(db, 'parties', code),
        {

          status: 'in_progress',

          game: 'taboo',

          gameState: {
            currentTurn: 0,
            currentPlayer:
              firstPlayer.uid,
            started: false,
            finished: false,
            timer: 60,
            currentCategory: null,
            currentWord: null,
            forbiddenWords: [],
            usedWords: [],
            scores: {}
          }
        }
      );

    } catch (error) {

      console.log(
        'Error starting taboo:',
        error
      );

      setMensaje(
        'Error starting game.'
      );
    }
  };

  // AUTO NAVIGATION
  useEffect(() => {

    const unsub = onSnapshot(
      doc(db, 'parties', code),
      (snap) => {

        if (!snap.exists()) return;

        const data = snap.data();

        if (
          data.status === 'in_progress' &&
          data.game === 'taboo'
        ) {

          navigation.replace(
            'taboo',
            { code }
          );
        }
      }
    );

    return unsub;

  }, []);

  return (
    <View style={styles.container}>

      {/* BACK BUTTON */}
      <TouchableOpacity
        onPress={() =>
          navigation.goBack()
        }
        style={styles.backButton}
      >

        <Ionicons
          name="arrow-back"
          size={26}
          color="white"
        />

      </TouchableOpacity>

      {/* HEADER */}
      <View style={styles.container1}>

        <View style={styles.container11}>

          <Image
            source={require('../Imagenes/logo.png')}
            style={{
              width: "100%",
              height: "60%"
            }}
          />

          <Text style={styles.title}>
            Green Monster
          </Text>

          <Text style={styles.subtitle}>
            Taboo - Rules
          </Text>

        </View>

        {/* PLAYERS */}
        <View style={styles.container12}>

          <View style={styles.container121}>

            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 13
              }}
            >
              Active Players
            </Text>

          </View>

          <View style={styles.container122}>

            <View
              style={{
                flexDirection: 'column',
                marginTop: 8
              }}
            >

              {activePlayers.map(
                (player) => (

                  <Text
                    key={player.uid}
                    style={{
                      color:
                        player.isHost
                          ? '#863535'
                          : 'white',

                      fontWeight: 'bold',
                      fontSize: 12,
                    }}
                  >

                    {player.username}

                    {player.uid === currentUid
                      ? " (You)"
                      : ""}

                  </Text>
                )
              )}

            </View>

          </View>

        </View>

      </View>

      {/* CARD */}
      <View style={styles.container2}>

        {/* LEFT */}
        <View style={styles.left}>

          <Image
            source={require('../Imagenes/taboo.png')}
            style={styles.image}
          />

          <Text style={styles.gameTitle}>
            Taboo
          </Text>

        </View>

        {/* RIGHT */}
        <View style={styles.right}>

          <Text style={styles.rules}>

            You will receive a word
            and 5 forbidden words.

            {"\n\n"}

            Help your team guess
            the main word without
            saying the forbidden ones.

            {"\n\n"}

            Press CHECK if guessed.

            {"\n\n"}

            Press X to skip.

            {"\n\n"}

            The player with the most
            points wins.

          </Text>

          <View style={styles.line} />

          <Text style={styles.info}>
            Number of players: 2 - 5
          </Text>

          <Text style={styles.info}>
            Approx time:
            1 minute per round
          </Text>

        </View>

      </View>

      {/* ERROR */}
      {mensaje !== '' && (

        <Text style={styles.error}>
          {mensaje}
        </Text>

      )}

      {/* START BUTTON */}
      <TouchableOpacity
        onPress={startGame}
        style={[
          styles.start,
          !isHost && {
            opacity: 0.5
          }
        ]}
        disabled={!isHost}
      >

        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold'
          }}
        >
          Start
        </Text>

      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#14213b',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  container1: {
    height: 120,
    width: "100%",
    marginTop: 70,
    marginBottom: 13,
    flexDirection: "row",
  },

  container11: {
    height: "100%",
    width: "50%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  container12: {
    height: "100%",
    width: "50%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  container121: {
    width: "80%",
    height: "20%",
    backgroundColor: "#5fba80",
    alignItems: "center",
    justifyContent: 'center',
    position: "relative",
    zIndex: 2,
  },

  container122: {
    width: "80%",
    height: "80%",
    backgroundColor: "#b9b9cf",
    alignItems: "center",
    borderRadius: 10,
    marginTop: -10,
    position: "relative",
    zIndex: 1,
  },

  title: {
    color: '#34d36e',
    fontSize: 15,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#676E7A',
    fontSize: 11,
    fontWeight: 'bold',
  },

  container2: {
    width: "92%",
    backgroundColor: "#1F2937",
    borderRadius: 15,
    flexDirection: "row",
    padding: 15,
    marginTop: 40,
  },

  left: {
    width: "40%",
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: 110,
    borderRadius: 10,
  },

  gameTitle: {
    color: "#C2C6CE",
    fontSize: 15,
    marginTop: 10,
    fontWeight: "bold",
  },

  right: {
    width: "60%",
    paddingLeft: 15,
    justifyContent: "center",
  },

  rules: {
    color: "#C2C6CE",
    fontSize: 13,
    lineHeight: 20,
  },

  line: {
    height: 1,
    backgroundColor: "#ffffff40",
    marginVertical: 12,
    width: "90%",
  },

  info: {
    color: "#C2C6CE",
    fontSize: 12,
    marginTop: 5,
  },

  start: {
    height: 55,
    width: "60%",
    backgroundColor: '#33A548',
    borderRadius: 12,
    marginTop: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "#ffffff20",
    padding: 8,
    borderRadius: 50,
  },

  error: {
    color: '#FF6B6B',
    marginTop: 15,
    fontWeight: 'bold',
  }
});
