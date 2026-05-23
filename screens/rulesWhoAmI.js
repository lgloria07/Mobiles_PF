import { useState, useContext } from 'react';

import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';

/* Conexion con fireStore */
import { auth, db }
from '../services/firebase';

import {
  doc,
  setDoc,
  updateDoc,
  getDoc
} from 'firebase/firestore';

import { Ionicons }
from '@expo/vector-icons';

import { charactersWho }
from '../data/charactersWho';

// Import hooks
import usePartyPlayers
from '../hooks/usePartyPlayers';

import { SettingsContext }
from '../services/SettingsContext';

export default function RulesWhoAmI({
  navigation,
  route
}) {

  const [mensaje, setMensaje] =
    useState('');

  // Jugadores activos
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
    currentPlayer?.isHost || false;

  // SETTINGS
  const {
    language,
    textSize,
    titleSize
  } = useContext(SettingsContext);

  // TEXTS
  const texts = {

    English: {
      subtitle: 'Who Am I? - Rules',
      activePlayers: 'Active Players',
      you: ' (You)',
      gameTitle: 'Who Am I?',

      rules:
        'You are going to be given a character from a list of possible options.\n\nAsk yes or no questions to figure out which character you are.\n\nYou can only guess your character one time, so make sure you are completely sure before answering.',

      players: 'Number of players: 2 - 5',
      time: 'Approx time: 10 minutes',
      start: 'Start',
    },

    Español: {
      subtitle: '¿Quién Soy? - Reglas',
      activePlayers: 'Jugadores Activos',
      you: ' (Tú)',
      gameTitle: '¿Quién Soy?',

      rules:
        'Se te asignará un personaje de una lista de opciones posibles.\n\nHaz preguntas de sí o no para descubrir qué personaje eres.\n\nSolo puedes intentar adivinar tu personaje una vez, así que asegúrate antes de responder.',

      players: 'Número de jugadores: 2 - 5',
      time: 'Tiempo aprox: 10 minutos',
      start: 'Iniciar',
    },

    Français: {
      subtitle: 'Qui Suis-Je ? - Règles',
      activePlayers: 'Joueurs Actifs',
      you: ' (Toi)',
      gameTitle: 'Qui Suis-Je ?',

      rules:
        'Un personnage vous sera attribué parmi une liste d’options possibles.\n\nPosez des questions auxquelles on répond par oui ou non afin de découvrir qui vous êtes.\n\nVous ne pouvez deviner votre personnage qu’une seule fois, alors soyez sûr avant de répondre.',

      players: 'Nombre de joueurs : 2 - 5',
      time: 'Temps approx : 10 minutes',
      start: 'Commencer',
    },

    中文: {
      subtitle: '我是谁？- 规则',
      activePlayers: '在线玩家',
      you: '（你）',
      gameTitle: '我是谁？',

      rules:
        '系统会从角色列表中随机分配一个角色给你。\n\n通过提问“是”或“不是”的问题来猜出你是谁。\n\n你只有一次机会猜测角色，所以回答前请确认。',

      players: '玩家人数：2 - 5',
      time: '预计时间：10分钟',
      start: '开始',
    }
  };

  const t = texts[language];

  const startGame = async () => {

    try {

      const partyRef =
        doc(db, 'parties', code);

      const partySnap =
        await getDoc(partyRef);

      if (!partySnap.exists())
        return;

      const data =
        partySnap.data();

      const members =
        data.members || [];

      // Mezclar personajes
      const shuffled =
        [...charactersWho]
          .sort(() =>
            0.5 - Math.random()
          );

      // Tomar 30
      const selectedCharacters =
        shuffled.slice(0, 30);

      // Asignar 1 personaje
      for (
        let i = 0;
        i < members.length;
        i++
      ) {

        const uid = members[i];

        const playerRef =
          doc(
            db,
            'parties',
            code,
            'players',
            uid
          );

        await setDoc(
          playerRef,
          {
            character:
              selectedCharacters[
                i %
                selectedCharacters.length
              ]
          },
          { merge: true }
        );
      }

      // Guardar pool global
      await updateDoc(
        partyRef,
        {
          status: 'in_progress',
          game: 'whoami',
          charactersPool:
            selectedCharacters
        }
      );

      navigation.navigate(
        'whoAmI',
        { code }
      );

    } catch (error) {

      console.error(
        'Error starting game: ',
        error
      );

      setMensaje(
        'Error starting game'
      );
    }
  };

  return (
    <View style={styles.container}>

      {/* Flecha return */}
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

      {/* Logo y Titulo */}
      <View style={styles.container1}>

        <View style={styles.container11}>

          <Image
            source={require('../Imagenes/logo.png')}
            style={{
              width: "100%",
              height: "60%"
            }}
          />

          <Text style={[styles.title,{fontSize:titleSize - 12}]}>
            Green Monster
          </Text>

          <Text
            style={[
              styles.subtitle,
              { fontSize: textSize - 3 }
            ]}
          >
            {t.subtitle}
          </Text>

        </View>

        {/* Jugadores Activos */}
        <View style={styles.container12}>

          <View style={styles.container121}>

            <Text
              style={{
                fontWeight: 'bold',
                fontSize: textSize - 1
              }}
            >
              {t.activePlayers}
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
                        textSize - 3,
                    }}
                  >

                    {player.username}

                    {player.uid === currentUid
                      ? t.you
                      : ""}

                  </Text>
                )
              )}

            </View>

          </View>

        </View>

      </View>

      {/* Carta de juego */}
      <View style={styles.container2}>

        {/* LEFT */}
        <View style={styles.left}>

          <Image
            source={require('../Imagenes/who.png')}
            style={styles.image}
          />

          <Text
            style={[
              styles.gameTitle,
              { fontSize: textSize }
            ]}
          >
            {t.gameTitle}
          </Text>

        </View>

        {/* RIGHT */}
        <View style={styles.right}>

          <Text
            style={[
              styles.rules,
              { fontSize: textSize - 2 }
            ]}
          >
            {t.rules}
          </Text>

          <View style={styles.line} />

          <Text
            style={[
              styles.info,
              { fontSize: textSize - 3 }
            ]}
          >
            {t.players}
          </Text>

          <Text
            style={[
              styles.info,
              { fontSize: textSize - 3 }
            ]}
          >
            {t.time}
          </Text>

        </View>

      </View>

      {/* Error */}
      {mensaje !== '' && (

        <Text style={styles.error}>
          {mensaje}
        </Text>

      )}

      {/* Boton Start */}
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
          {t.start}
        </Text>

      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    flexDirection:'column',
    backgroundColor: '#14213b',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  container1:{
    height:120,
    width:"100%",
    marginTop:70,
    marginBottom:13,
    flexDirection:"row",
  },

  container11:{
    height:"100%",
    width:"50%",
    flexDirection:"column",
    alignItems:"center",
    justifyContent:"center",
  },

  container12:{
    height:"100%",
    width:"50%",
    flexDirection:"column",
    alignItems:"center",
    justifyContent:"flex-start",
  },

  line: {
    height: 1,
    backgroundColor: "#ffffff40",
    marginVertical: 12,
    width: "90%",
  },

  container121:{
    width:"80%",
    height:"20%",
    backgroundColor:"#5fba80",
    alignItems:"center",
    justifyContent:'center',
    position: "relative",
    zIndex: 2,
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

  container122:{
    width:"80%",
    height:"80%",
    backgroundColor:"#b9b9cf",
    alignItems:"center",
    borderRadius:10,
    marginTop:-10,
    position: "relative",
    zIndex: 1,
  },

  title:{
    color:'#34d36e',
    fontWeight:'bold',
  },

  subtitle:{
    color:'#676E7A',
    fontWeight:'bold',
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
    justifyContent:"center",
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

  info: {
    color: "#C2C6CE",
    marginTop: 5,
  },

  start:{
    height:55,
    width:"60%",
    backgroundColor:'#33A548',
    borderRadius:12,
    marginTop:25,
    alignItems:'center',
    justifyContent:'center',
  },

  error: {
    color: '#FF6B6B',
    marginTop: 15,
    fontWeight: 'bold',
  }
});