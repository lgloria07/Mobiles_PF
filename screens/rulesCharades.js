import { useState, useEffect, useContext } from 'react';

import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';

import { auth, db } from '../services/firebase';

import {
  doc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';

import { Ionicons } from '@expo/vector-icons';

import usePartyPlayers from '../hooks/usePartyPlayers';

import { SettingsContext } from '../services/SettingsContext';

export default function RulesCharades({
  navigation,
  route
}) {

  const [mensaje, setMensaje] = useState('');

  const { code } = route.params;

  /* Context */
  const {
    language,
    textSize,
    titleSize
  } = useContext(SettingsContext);

  /* Active players */
  const { activePlayers } = usePartyPlayers(code);

  const currentUid = auth.currentUser?.uid;

  const currentPlayer =
    activePlayers.find(
      p => p.uid === currentUid
    );

  const isHost = currentPlayer?.isHost || false;

  /* Traducciones */
  const texts = {

    English: {

      subtitle: 'Charades - Rules',

      activePlayers: 'Active Players',

      you: '(You)',

      gameTitle: 'Charades',

      rules:
`Each player will have 3 turns.

Place the phone on your forehead while the other players help you guess the word.

Press "CHECK" if guessed correctly.

Press "X" to skip the word.

The player with the most points wins.`,

      playersInfo: 'Number of players: 2 - 5',

      timeInfo: 'Approx time: 1 minute per round',

      start: 'Start',

      error: 'Error starting game.',
    },

    Español: {

      subtitle: 'Charadas - Reglas',

      activePlayers: 'Jugadores Activos',

      you: '(Tú)',

      gameTitle: 'Charadas',

      rules:
`Cada jugador tendrá 3 turnos.

Coloca el teléfono en tu frente mientras los otros jugadores te ayudan a adivinar la palabra.

Presiona "CHECK" si adivinaste correctamente.

Presiona "X" para saltar la palabra.

El jugador con más puntos gana.`,

      playersInfo: 'Número de jugadores: 2 - 5',

      timeInfo: 'Tiempo aproximado: 1 minuto por ronda',

      start: 'Iniciar',

      error: 'Error al iniciar el juego.',
    },

    Français: {

      subtitle: 'Charades - Règles',

      activePlayers: 'Joueurs Actifs',

      you: '(Vous)',

      gameTitle: 'Charades',

      rules:
`Chaque joueur aura 3 tours.

Placez le téléphone sur votre front pendant que les autres joueurs vous aident à deviner le mot.

Appuyez sur "CHECK" si la réponse est correcte.

Appuyez sur "X" pour passer le mot.

Le joueur avec le plus de points gagne.`,

      playersInfo: 'Nombre de joueurs: 2 - 5',

      timeInfo: 'Temps approximatif: 1 minute par manche',

      start: 'Commencer',

      error: 'Erreur lors du démarrage du jeu.',
    },

    中文: {

      subtitle: '你演我猜 - 规则',

      activePlayers: '在线玩家',

      you: '(你)',

      gameTitle: '你演我猜',

      rules:
`每位玩家将有3个回合。

将手机放在额头上，其他玩家会帮助你猜单词。

如果猜对了，请按“CHECK”。

按“X”可以跳过单词。

得分最高的玩家获胜。`,

      playersInfo: '玩家人数: 2 - 5',

      timeInfo: '预计时间: 每轮1分钟',

      start: '开始',

      error: '启动游戏时出错。',
    }
  };

  /* START GAME */
  const startGame = async () => {

    try {

      const firstPlayer = activePlayers[0];

      await updateDoc(
        doc(db, 'parties', code),
        {

          status: 'in_progress',

          game: 'charades',

          gameState: {

            currentTurn: 0,

            currentPlayer: firstPlayer.uid,

            started: false,

            finished: false,

            timer: 2,

            currentCategory: null,

            currentWord: null,

            usedWords: [],

            scores: {}
          }
        }
      );

    } catch (error) {

      console.log(
        'Error starting charades:',
        error
      );

      setMensaje(
        texts[language].error
      );
    }
  };

  /* AUTO NAVIGATION */
  useEffect(() => {

    const unsub = onSnapshot(

      doc(db, 'parties', code),

      (snap) => {

        if (!snap.exists()) return;

        const data = snap.data();

        if (
          data.status === 'in_progress' &&
          data.game === 'charades'
        ) {

          navigation.replace(
            'charades',
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
        onPress={() => navigation.goBack()}
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

        {/* LEFT */}
        <View style={styles.container11}>

          <Image
            source={require('../Imagenes/logo.png')}
            style={{
              width: "100%",
              height: "60%"
            }}
          />

          <Text
            style={[
              styles.title,
              {
                fontSize:
                  titleSize - 12
              }
            ]}
          >
            Green Monster
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                fontSize:
                  textSize - 3
              }
            ]}
          >
            {texts[language].subtitle}
          </Text>

        </View>

        {/* PLAYERS */}
        <View style={styles.container12}>

          <View style={styles.container121}>

            <Text
              style={{
                fontWeight: 'bold',
                fontSize: textSize - 3
              }}
            >
              {
                texts[language]
                  .activePlayers
              }
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

                    fontSize:
                      textSize - 4,
                  }}
                >

                  {player.username}

                  {
                    player.uid === currentUid
                    ? ` ${texts[language].you}`
                    : ""
                  }

                </Text>

              ))}

            </View>

          </View>

        </View>

      </View>

      {/* GAME CARD */}
      <View style={styles.container2}>

        {/* LEFT */}
        <View style={styles.left}>

          <Image
            source={require('../Imagenes/charades.png')}
            style={styles.image}
          />

          <Text
            style={[
              styles.gameTitle,
              {
                fontSize:
                  textSize
              }
            ]}
          >
            {
              texts[language]
                .gameTitle
            }
          </Text>

        </View>

        {/* RIGHT */}
        <View style={styles.right}>

          <Text
            style={[
              styles.rules,
              {
                fontSize:
                  textSize - 2
              }
            ]}
          >
            {texts[language].rules}
          </Text>

          <View style={styles.line} />

          <Text
            style={[
              styles.info,
              {
                fontSize:
                  textSize - 3
              }
            ]}
          >
            {
              texts[language]
                .playersInfo
            }
          </Text>

          <Text
            style={[
              styles.info,
              {
                fontSize:
                  textSize - 3
              }
            ]}
          >
            {
              texts[language]
                .timeInfo
            }
          </Text>

        </View>

      </View>

      {/* ERROR */}
      {mensaje !== '' && (

        <Text
          style={[
            styles.error,
            {
              fontSize:
                textSize - 1
            }
          ]}
        >
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
            fontSize: textSize + 2,
            fontWeight: 'bold'
          }}
        >
          {texts[language].start}
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
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#676E7A',
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
    marginTop: 10,
    fontWeight: "bold",
    textAlign: 'center',
  },

  right: {
    width: "60%",
    paddingLeft: 15,
    justifyContent: "center",
  },

  rules: {
    color: "#C2C6CE",
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