import {
  useState,
  useContext
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';

/* FIRESTORE */
import {
  auth,
  db
} from '../services/firebase';

import {
  doc,
  setDoc,
  updateDoc,
  getDoc
} from 'firebase/firestore';

import { Ionicons }
from '@expo/vector-icons';

import { categoriesEN}
from '../data/categoriesTowerEN';

import { categoriesES }
from '../data/categoriesTowerES';

import { categoriesFR }
from '../data/categoriesTowerFR';

import { categoriesZH }
from '../data/categoriesTowerZH';

/* HOOKS */
import usePartyPlayers
from '../hooks/usePartyPlayers';

/* SETTINGS */
import { SettingsContext }
from '../services/SettingsContext';

export default function RulesTower({
  navigation,
  route
}) {

  const [mensaje, setMensaje] =
    useState('');

  /* SETTINGS CONTEXT */
  const {
    language,
    textSize,
    titleSize
  } = useContext(SettingsContext);

  /* PLAYERS */
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

  /* TRANSLATIONS */
  const texts = {

    English: {

      subtitle:
        'Tower Of Nerds - Rules',

      activePlayers:
        'Active Players',

      you: '(You)',

      gameTitle:
        'Tower of Nerds',

      rules:
`You are going to be given a category. You'll have to guess characters that fit the given category.

If you guess right, you add them to your tower and can guess again.

If you guess your category incorrectly, you lose.

(Be careful, you only have one attempt to guess the category).`,

      playersInfo:
        'Number of players: 2 - 5',

      timeInfo:
        'Approx time: 10 minutes',

      start:
        'Start',

      error:
        'Error starting game. Please try again.',
    },

    Español: {

      subtitle:
        'Tower Of Nerds - Reglas',

      activePlayers:
        'Jugadores Activos',

      you: '(Tú)',

      gameTitle:
        'Tower of Nerds',

      rules:
`Se te dará una categoría. Tendrás que adivinar personajes que pertenezcan a esa categoría.

Si adivinas correctamente, los agregas a tu torre y puedes seguir adivinando.

Si adivinas incorrectamente tu categoría, pierdes.

(Ten cuidado, solo tienes un intento para adivinar la categoría).`,

      playersInfo:
        'Número de jugadores: 2 - 5',

      timeInfo:
        'Tiempo aproximado: 10 minutos',

      start:
        'Iniciar',

      error:
        'Error al iniciar el juego. Intenta nuevamente.',
    },

    Français: {

      subtitle:
        'Tower Of Nerds - Règles',

      activePlayers:
        'Joueurs Actifs',

      you: '(Vous)',

      gameTitle:
        'Tower of Nerds',

      rules:
`Vous recevrez une catégorie. Vous devrez deviner des personnages correspondant à cette catégorie.

Si vous devinez correctement, vous les ajoutez à votre tour et pouvez continuer.

Si vous devinez incorrectement votre catégorie, vous perdez.

(Faites attention, vous n'avez qu'une seule tentative pour deviner la catégorie).`,

      playersInfo:
        'Nombre de joueurs: 2 - 5',

      timeInfo:
        'Temps approximatif: 10 minutes',

      start:
        'Commencer',

      error:
        'Erreur lors du démarrage du jeu.',
    },

    中文: {

      subtitle:
        'Tower Of Nerds - 规则',

      activePlayers:
        '在线玩家',

      you: '(你)',

      gameTitle:
        'Tower of Nerds',

      rules:
`你将获得一个类别。

你需要猜出符合该类别的角色。

如果猜对了，你可以把他们加入你的塔并继续猜。

如果猜错了你的类别，你就输了。

（小心，你只有一次机会猜类别）。`,

      playersInfo:
        '玩家人数: 2 - 5',

      timeInfo:
        '预计时间: 10分钟',

      start:
        '开始',

      error:
        '启动游戏时出错，请重试。',
    }
  };
  /* CATEGORY LIST BY LANGUAGE */
  const categoriesByLanguage = {

    English:
      categoriesEN,

    Español:
      categoriesES,

    Français:
      categoriesFR,

    中文:
      categoriesZH,
  };

  const selectedCategories =
    categoriesByLanguage[language] ||
    categoriesEN;

  /* START GAME */
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

      /* RANDOM CATEGORIES */
      const shuffled =
        [...selectedCategories]
        .sort(() => 0.5 - Math.random());

      for (
        let i = 0;
        i < members.length;
        i++
      ) {

        const uid =
          members[i];

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
            category:
              shuffled[
                i % shuffled.length
              ]
          },
          { merge: true }
        );
      }

      /* SAVE GAME STATE */
      await updateDoc(
        partyRef,
        {
          status: 'in_progress',
          game: 'tower'
        }
      );

      navigation.replace(
        'tower',
        { code }
      );

    } catch (error) {

      console.error(
        'Error starting game: ',
        error
      );

      setMensaje(
        texts[language].error
      );
    }
  };

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
            {
              texts[language]
                .subtitle
            }
          </Text>

        </View>

        {/* ACTIVE PLAYERS */}
        <View style={styles.container12}>

          <View style={styles.container121}>

            <Text
              style={{
                fontWeight: 'bold',
                fontSize:
                  textSize - 3
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
                )
              )}

            </View>

          </View>

        </View>

      </View>

      {/* GAME CARD */}
      <View style={styles.container2}>

        {/* LEFT */}
        <View style={styles.left}>

          <Image
            source={require('../Imagenes/tower.png')}
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
            {
              texts[language]
                .rules
            }
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
            fontSize:
              textSize + 2,
            fontWeight: 'bold'
          }}
        >
          {
            texts[language]
              .start
          }
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

  container121:{
    width:"80%",
    height:"20%",
    backgroundColor:"#5fba80",
    alignItems:"center",
    justifyContent:'center',
    position: "relative",
    zIndex: 2,
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

  line: {
    height: 1,
    backgroundColor: "#ffffff40",
    marginVertical: 12,
    width: "90%",
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
    textAlign:'center',
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