import React, {
  useState,
  useEffect,
  useContext
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  auth,
  db
} from '../services/firebase';

import usePartyPlayers from '../hooks/usePartyPlayers';

import {
  useIsFocused
} from '@react-navigation/native';

import {
  doc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';

import {
  SettingsContext
} from '../services/SettingsContext';

export default function TowerOfNerds({
  navigation,
  route
}) {

  const { code } = route.params;

  const { activePlayers } =
    usePartyPlayers(code);

  const currentUid =
    auth.currentUser?.uid;

  const currentPlayer =
    activePlayers.find(
      p => p.uid === currentUid
    );

  const isHost =
    currentPlayer?.isHost;

  const {
    language,
    textSize,
    titleSize
  } = useContext(SettingsContext);

  // TRANSLATIONS
  const texts = {

    English: {
      title: 'TOWER OF NERDS',
      name: 'Name',
      category: 'Category',
      you: '(You)',
      guessing: 'is guessing...',
      vote: 'Vote if this player is right or wrong',
      won: 'has won!',
      wrongGuess: 'Wrong guess!',
      guess: 'GUESS',
      character: 'Character'
    },

    Español: {
      title: 'TORRE DE NERDS',
      name: 'Nombre',
      category: 'Categoría',
      you: '(Tú)',
      guessing: 'está adivinando...',
      vote: 'Vota si este jugador está correcto o no',
      won: 'ha ganado!',
      wrongGuess: '¡Respuesta incorrecta!',
      guess: 'ADIVINAR',
      character: 'Personaje'
    },

    Français: {
      title: 'TOUR DES NERDS',
      name: 'Nom',
      category: 'Catégorie',
      you: '(Toi)',
      guessing: 'devine...',
      vote: 'Vote si ce joueur a raison ou tort',
      won: 'a gagné !',
      wrongGuess: 'Mauvaise réponse !',
      guess: 'DEVINER',
      character: 'Personnage'
    },

    中文: {
      title: '宅男高塔',
      name: '名字',
      category: '类别',
      you: '(你)',
      guessing: '正在猜...',
      vote: '投票判断玩家是否正确',
      won: '赢了！',
      wrongGuess: '猜错了！',
      guess: '猜测',
      character: '角色'
    }
  };

  const t = texts[language];

  const [tower, setTower] =
    useState([
      '',
      '',
      '',
      '',
      '',
      ''
    ]);

  const [gameState, setGameState] =
    useState(null);

  const [hasNavigated, setHasNavigated] =
    useState(false);

  const isFocused =
    useIsFocused();

  // UPDATE TOWER INPUT
  const updateTowerItem = (
    text,
    index
  ) => {

    const updatedTower = [
      ...tower
    ];

    updatedTower[index] = text;

    setTower(updatedTower);
  };

  // LISTEN FIREBASE
  useEffect(() => {

    const unsub =
      onSnapshot(
        doc(db, 'parties', code),
        (snap) => {

          if (!snap.exists()) return;

          setGameState(
            snap.data().gameState || null
          );
        }
      );

    return unsub;

  }, [code]);

  // START GUESS
  const handleGuess = async () => {

    if (
      gameState?.isGuessing ||
      currentPlayer?.eliminated
    ) return;

    await updateDoc(
      doc(db, 'parties', code),
      {
        gameState: {
          isGuessing: true,
          guessingPlayer: currentUid,
          votes: {},
          finished: false,
        },
      }
    );
  };

  // VOTE
  const vote = async (
    value
  ) => {

    if (
      currentUid ===
      gameState?.guessingPlayer
    ) return;

    if (
      gameState?.votes?.[
        currentUid
      ] !== undefined
    ) return;

    await updateDoc(
      doc(db, 'parties', code),
      {
        [`gameState.votes.${currentUid}`]:
          value,
      }
    );
  };

  // CHECK VOTES
  useEffect(() => {

    if (
      !gameState ||
      !gameState.isGuessing ||
      gameState.finished
    ) return;

    const votes =
      gameState.votes || {};

    const totalPlayers =
      activePlayers.length - 1;

    if (
      Object.keys(votes).length ===
        totalPlayers &&
      totalPlayers > 0
    ) {

      const values =
        Object.values(votes);

      const yes =
        values.filter(v => v).length;

      const no =
        values.filter(v => !v).length;

      const result =
        yes > no;

      updateDoc(
        doc(db, 'parties', code),
        {
          gameState: {
            ...gameState,
            finished: true,
            winner: result
              ? gameState.guessingPlayer
              : null,
            loser: !result
              ? gameState.guessingPlayer
              : null,
          }
        }
      );
    }

  }, [gameState, activePlayers]);

  const guessingPlayer =
    activePlayers.find(
      p =>
        p.uid ===
        gameState?.guessingPlayer
    );

  // RESET GAME
  useEffect(() => {

    if (
      !gameState?.finished ||
      !isHost
    ) return;

    const timeout =
      setTimeout(async () => {

        if (gameState.winner) {

          await updateDoc(
            doc(db, 'parties', code),
            {
              status: 'waiting',
              game: null,
              gameState: null,
            }
          );

        } else {

          await updateDoc(
            doc(db, 'parties', code),
            {
              gameState: null
            }
          );
        }

      }, 3000);

    return () =>
      clearTimeout(timeout);

  }, [gameState, isHost]);

  // NAVIGATION
  useEffect(() => {

    if (
      gameState?.finished &&
      gameState?.winner &&
      !hasNavigated
    ) {

      setHasNavigated(true);

      const timeout =
        setTimeout(() => {

          navigation.replace(
            'gameSelection',
            { code }
          );

        }, 3000);

      return () =>
        clearTimeout(timeout);
    }

  }, [gameState]);

  return (

    <View style={styles.container}>

      {/* GUESS MODAL */}
      {gameState?.isGuessing &&
        !gameState?.finished &&
        gameState.guessingPlayer !== currentUid && (

          <Modal
            transparent
            animationType="fade"
          >

            <View style={styles.modalBackground}>

              <View style={styles.modalCard}>

                <Text
                  style={[
                    styles.modalTitle,
                    {
                      fontSize:
                        textSize + 4
                    }
                  ]}
                >
                  {
                    guessingPlayer?.username ||
                    'Player'
                  } {t.guessing}
                </Text>

                <Text
                  style={[
                    styles.modalText,
                    {
                      fontSize:
                        textSize
                    }
                  ]}
                >
                  {t.vote}
                </Text>

                <View
                  style={{
                    flexDirection: 'row'
                  }}
                >

                  <TouchableOpacity
                    onPress={() =>
                      vote(true)
                    }
                    style={{
                      margin: 10
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 30
                      }}
                    >
                      ✔️
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      vote(false)
                    }
                    style={{
                      margin: 10
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 30
                      }}
                    >
                      ❌
                    </Text>
                  </TouchableOpacity>

                </View>

              </View>

            </View>

          </Modal>
      )}

      {/* RESULT MODAL */}
      {gameState?.finished && (

        <Modal
          transparent
          animationType="fade"
        >

          <View style={styles.modalBackground}>

            <View style={styles.modalCard}>

              <Text
                style={[
                  styles.modalTitle,
                  {
                    fontSize:
                      textSize + 4
                  }
                ]}
              >
                {gameState.winner
                  ? `${guessingPlayer?.username} ${t.won}`
                  : t.wrongGuess}
              </Text>

            </View>

          </View>

        </Modal>
      )}

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
      <View style={styles.header}>

        <Image
          source={require('../Imagenes/logo.png')}
          style={styles.logo}
        />

        <Text
          style={[
            styles.title,
            {
              fontSize:
                titleSize - 2
            }
          ]}
        >
          {t.title}
        </Text>

      </View>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* PLAYERS */}
        <View
          style={
            styles.playersContainer
          }
        >

          <View
            style={
              styles.playersHeader
            }
          >

            <Text
              style={[
                styles.headerText,
                {
                  fontSize:
                    textSize
                }
              ]}
            >
              {t.name}
            </Text>

            <Text
              style={[
                styles.headerText,
                {
                  fontSize:
                    textSize
                }
              ]}
            >
              {t.category}
            </Text>

          </View>

          {activePlayers.map(
            player => (

              <View
                key={player.uid}
                style={
                  styles.playerRow
                }
              >

                <Text
                  style={[
                    styles.playerName,
                    {
                      fontSize:
                        textSize - 1
                    },
                    player.uid ===
                      currentUid &&
                      styles.currentPlayer,
                    player.eliminated && {
                      color: 'red'
                    }
                  ]}
                >
                  {player.username}

                  {player.uid ===
                  currentUid
                    ? ` ${t.you}`
                    : ''}
                </Text>

                <Text
                  style={[
                    styles.playerCategory,
                    {
                      fontSize:
                        textSize - 1
                    }
                  ]}
                >
                  {player.eliminated
                    ? player.category
                    : player.uid ===
                      currentUid
                    ? '????'
                    : player.category ||
                      '....'}
                </Text>

              </View>
            )
          )}

        </View>

        {/* TOWER */}
        <View style={styles.tower}>

          {tower.map(
            (item, index) => (

              <TextInput
                key={index}
                style={[
                  styles.towerInput,
                  {
                    fontSize:
                      textSize
                  }
                ]}
                placeholder={`${t.character} ${index + 1}`}
                placeholderTextColor="#64748B"
                value={item}
                onChangeText={text =>
                  updateTowerItem(
                    text,
                    index
                  )
                }
              />
            )
          )}

        </View>

        {/* GUESS BUTTON */}
        <TouchableOpacity
          onPress={handleGuess}
          style={[
            styles.guessButton,
            gameState?.isGuessing && {
              opacity: 0.5
            }
          ]}
          disabled={
            gameState?.isGuessing ||
            currentPlayer?.eliminated
          }
        >

          <Text
            style={[
              styles.guessButtonText,
              {
                fontSize:
                  textSize + 2
              }
            ]}
          >
            {t.guess}
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </View>
  );
}

const styles =
  StyleSheet.create({

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
      fontWeight: 'bold',
      marginTop: -5,
      textAlign: 'center'
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
      width: '48%',
    },

    currentPlayer: {
      color: '#FF6B6B',
      fontWeight: 'bold',
    },

    playerCategory: {
      color: '#C2C6CE',
      width: '48%',
    },

    tower: {
      width: '75%',
      alignItems: 'center'
    },

    towerInput: {
      width: 220,
      height: 52,
      borderWidth: 2,
      borderColor: '#E5E7EB',
      backgroundColor: '#F8FAFC',
      borderRadius: 10,
      marginBottom: 10,
      paddingHorizontal: 12,
      color: '#0F172A',
      fontWeight: 'bold',
    },

    guessButton: {
      marginTop: 30,
      width: 160,
      height: 52,
      backgroundColor: '#33A548',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },

    guessButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },

    modalBackground: {
      flex: 1,
      backgroundColor:
        'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center'
    },

    modalCard: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 12,
      alignItems: 'center',
      width: '80%'
    },

    modalTitle: {
      fontWeight: 'bold',
      textAlign: 'center'
    },

    modalText: {
      marginVertical: 10,
      textAlign: 'center'
    }
  });