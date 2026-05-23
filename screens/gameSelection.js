import { useState, useEffect, useContext } from 'react';

import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView
} from 'react-native';

/* Conexion con fireStore */
import { auth, db } from '../services/firebase';

import {
  doc,
  updateDoc,
  getDoc,
  arrayRemove,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

import { signOut as firebaseSignOut } from 'firebase/auth';

import { Ionicons } from '@expo/vector-icons';

// Hook
import usePartyPlayers from '../hooks/usePartyPlayers';

import { SettingsContext } from '../services/SettingsContext';

export default function GameSelection({ navigation, route }) {

  const [mensaje, setMensaje] = useState('');

  const { code } = route.params;

  const { activePlayers } = usePartyPlayers(code);

  const currentUid = auth.currentUser?.uid;

  const currentPlayer =
    activePlayers.find(p => p.uid === currentUid);

  const isHost = currentPlayer?.isHost || false;

  const {
    language,
    textSize,
    titleSize
  } = useContext(SettingsContext);

  /* Traducciones */
  const texts = {

    English: {
      subtitle: 'Select a game',
      activePlayers: 'Active Players',
      you: '(You)',
      partyCode: 'Party Code',
      play: 'Play',
      signOut: 'Sign Out',
      charades: 'Charades',
      tower: 'Tower of Nerds',
      taboo: 'Taboo',
      whoAmI: 'Who am I?',
      onlineGames: 'ONLINE GAMES',
      offlineGames: 'OFFLINE GAMES',
    },

    Español: {
      subtitle: 'Selecciona un juego',
      activePlayers: 'Jugadores Activos',
      you: '(Tú)',
      partyCode: 'Código de Fiesta',
      play: 'Jugar',
      signOut: 'Cerrar Sesión',
      charades: 'Charadas',
      tower: 'Torre de Nerds',
      taboo: 'Tabú',
      whoAmI: '¿Quién soy?',
      onlineGames: 'JUEGOS ONLINE',
      offlineGames: 'JUEGOS OFFLINE',
    },

    Français: {
      subtitle: 'Choisissez un jeu',
      activePlayers: 'Joueurs Actifs',
      you: '(Vous)',
      partyCode: 'Code de Fête',
      play: 'Jouer',
      signOut: 'Déconnexion',
      charades: 'Charades',
      tower: 'Tour des Nerds',
      taboo: 'Tabou',
      whoAmI: 'Qui suis-je?',
      onlineGames: 'JEUX EN LIGNE',
      offlineGames: 'JEUX HORS LIGNE',
    },

    中文: {
      subtitle: '选择一个游戏',
      activePlayers: '在线玩家',
      you: '(你)',
      partyCode: '派对代码',
      play: '开始',
      signOut: '退出登录',
      charades: '你演我猜',
      tower: '书呆子塔',
      taboo: '禁忌词',
      whoAmI: '我是谁？',
      onlineGames: '在线游戏',
      offlineGames: '离线游戏',
    }
  };

  /* Navegacion juegos */
  const charades = () => {
    navigation.navigate('rulesCharades', { code });
  };

  const towerOfNerds = () => {
    navigation.navigate('rulesTower', { code });
  };

  const taboo = () => {
    navigation.navigate('rulesTaboo', { code });
  };

  const whoAmI = () => {
    navigation.navigate('rulesWhoAmI', { code });
  };

  const signOut = async () => {

    try {

      await leaveParty();

      await firebaseSignOut(auth);

      navigation.replace('login');

    } catch (error) {

      console.log(error);
    }
  };

  const leaveParty = async () => {

    try {

      const user = auth.currentUser;

      if (!user) return;

      const partyRef = doc(db, "parties", code);

      await updateDoc(partyRef, {
        members: arrayRemove(user.uid)
      });

      const updatedSnap = await getDoc(partyRef);

      if (!updatedSnap.exists()) return;

      const updatedData = updatedSnap.data();

      if (
        !updatedData.members ||
        updatedData.members.length === 0
      ) {

        await deleteDoc(partyRef);
      }

    } catch (error) {

      console.log("leaveParty error:", error);
    }
  };

  useEffect(() => {

    const partyRef = doc(db, "parties", code);

    const unsubscribe = onSnapshot(
      partyRef,
      (snapshot) => {

        if (!snapshot.exists()) return;

        const data = snapshot.data();

        if (data.status === "in_progress") {

          if (data.game === "tower") {
            navigation.navigate("tower", { code });
          }

          if (data.game === "charades") {
            navigation.replace("charades", { code });
          }

          if (data.game === "taboo") {
            navigation.navigate("taboo", { code });
          }

          if (data.game === "whoami") {
            navigation.navigate("whoAmI", { code });
          }
        }
      }
    );

    return unsubscribe;

  }, [code, navigation]);

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        alignItems: 'center',
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >

      {/* Boton Settings */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('settings')}
      >
        <Ionicons
          name="settings-outline"
          size={30}
          color="white"
        />
      </TouchableOpacity>

      {/* Flecha return */}
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

      {/* Header */}
      <View style={styles.container1}>

        {/* Logo */}
        <View style={styles.container11}>

          <Image
            source={require('../Imagenes/logo.png')}
            style={{ width: "100%", height: "60%" }}
          />

          <Text
            style={[
              styles.title,
              { fontSize: titleSize - 12 }
            ]}
          >
            Green Monster
          </Text>

          <Text
            style={[
              styles.subtitle,
              { fontSize: textSize - 3 }
            ]}
          >
            {texts[language].subtitle}
          </Text>

        </View>

        {/* Jugadores */}
        <View style={styles.container12}>

          <View style={styles.container121}>

            <Text
              style={{
                fontWeight: 'bold',
                fontSize: textSize - 3
              }}
            >
              {texts[language].activePlayers}
            </Text>

          </View>

          <View style={styles.container122}>

            <View
              style={{
                flexDirection: 'column',
                marginTop: 8,
              }}
            >

              {activePlayers.map((player) => (

                <Text
                  key={player.uid}
                  style={{
                    color:
                      player.isHost
                        ? '#863535'
                        : 'black',

                    fontWeight: 'bold',

                    fontSize: textSize - 4,
                  }}
                >
                  {player.username}

                  {player.uid === currentUid
                    ? ` ${texts[language].you}`
                    : ""}
                </Text>

              ))}

            </View>

          </View>

        </View>

      </View>

      {/* Codigo */}
      <Text
        style={[
          styles.code,
          { fontSize: textSize }
        ]}
      >
        {texts[language].partyCode}: {code}
      </Text>

      {/* ONLINE GAMES */}
      <View style={styles.sectionContainer}>

        <View style={styles.sectionDivider}>
          <View style={styles.line} />

          <Text
            style={[
              styles.sectionTitle,
              { fontSize: textSize - 1 }
            ]}
          >
            {texts[language].onlineGames}
          </Text>

          <View style={styles.line} />
        </View>

        <View style={styles.gamesRow}>

          {/* Tower */}
          <View style={styles.gameCard}>

            <View style={styles.imageContainer}>
              <Image
                source={require('../Imagenes/tower.png')}
                style={styles.image}
              />
            </View>

            <View style={styles.gameInfo}>

              <Text
                style={[
                  styles.gameTitle,
                  { fontSize: textSize }
                ]}
              >
                {texts[language].tower}
              </Text>

              <TouchableOpacity
                onPress={towerOfNerds}
                style={[
                  styles.join,
                  !isHost && { opacity: 0.4 }
                ]}
                disabled={!isHost}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: textSize - 2,
                    fontWeight: 'bold'
                  }}
                >
                  {texts[language].play}
                </Text>
              </TouchableOpacity>

            </View>

          </View>

          {/* Who Am I */}
          <View style={styles.gameCard}>

            <View style={styles.imageContainer}>
              <Image
                source={require('../Imagenes/who.png')}
                style={styles.image}
              />
            </View>

            <View style={styles.gameInfo}>

              <Text
                style={[
                  styles.gameTitle,
                  { fontSize: textSize }
                ]}
              >
                {texts[language].whoAmI}
              </Text>

              <TouchableOpacity
                onPress={whoAmI}
                style={[
                  styles.join,
                  !isHost && { opacity: 0.4 }
                ]}
                disabled={!isHost}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: textSize - 2,
                    fontWeight: 'bold'
                  }}
                >
                  {texts[language].play}
                </Text>
              </TouchableOpacity>

            </View>

          </View>

        </View>

      </View>

      {/* OFFLINE GAMES */}
      <View style={styles.sectionContainer}>

        <View style={styles.sectionDivider}>
          <View style={styles.line} />

          <Text
            style={[
              styles.sectionTitle,
              { fontSize: textSize - 1 }
            ]}
          >
            {texts[language].offlineGames}
          </Text>

          <View style={styles.line} />
        </View>

        <View style={styles.gamesRow}>

          {/* Charades */}
          <View style={styles.gameCard}>

            <View style={styles.imageContainer}>
              <Image
                source={require('../Imagenes/charades.png')}
                style={styles.image}
              />
            </View>

            <View style={styles.gameInfo}>

              <Text
                style={[
                  styles.gameTitle,
                  { fontSize: textSize }
                ]}
              >
                {texts[language].charades}
              </Text>

              <TouchableOpacity
                onPress={charades}
                style={[
                  styles.join,
                  !isHost && { opacity: 0.4 }
                ]}
                disabled={!isHost}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: textSize - 2,
                    fontWeight: 'bold'
                  }}
                >
                  {texts[language].play}
                </Text>
              </TouchableOpacity>

            </View>

          </View>

          {/* Taboo */}
          <View style={styles.gameCard}>

            <View style={styles.imageContainer}>
              <Image
                source={require('../Imagenes/taboo.png')}
                style={styles.image}
              />
            </View>

            <View style={styles.gameInfo}>

              <Text
                style={[
                  styles.gameTitle,
                  { fontSize: textSize }
                ]}
              >
                {texts[language].taboo}
              </Text>

              <TouchableOpacity
                onPress={taboo}
                style={[
                  styles.join,
                  !isHost && { opacity: 0.4 }
                ]}
                disabled={!isHost}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: textSize - 2,
                    fontWeight: 'bold'
                  }}
                >
                  {texts[language].play}
                </Text>
              </TouchableOpacity>

            </View>

          </View>

        </View>

      </View>

      {/* Sign Out */}
      <TouchableOpacity
        onPress={signOut}
        style={styles.signOut}
      >
        <Text
          style={{
            color: 'white',
            fontSize: textSize - 2,
            fontWeight: 'bold'
          }}
        >
          {texts[language].signOut}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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

  code: {
    color: '#C2C6CE',
    marginBottom: 15,
    fontWeight: 'bold',
  },

  sectionContainer: {
    width: "100%",
    marginTop: 10,
    alignItems: "center",
  },

  sectionDivider: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ffffff40",
  },

  sectionTitle: {
    color: "#34d36e",
    fontWeight: "bold",
    marginHorizontal: 10,
  },

  gamesRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },

  gameCard: {
    width: "45%",
    height: 280,
    backgroundColor: "#1E293B",
    borderRadius: 20,
  },

  imageContainer: {
    width: "100%",
    height: "60%",
    alignItems: "center",
    justifyContent: "center",
  },

  gameInfo: {
    width: "100%",
    height: "40%",
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    height: "80%",
    width: "80%",
    borderWidth: 0.2,
    borderColor: "white",
    borderRadius: 10,
  },

  gameTitle: {
    color: "white",
    fontWeight: "bold",
    textAlign: 'center',
    marginTop: -20,
  },

  signOut: {
    height: 40,
    width: 150,
    backgroundColor: '#863535',
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  join: {
    height: 40,
    width: "70%",
    backgroundColor: '#33A548',
    borderRadius: 8,
    marginTop: 10,
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

  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 25,
    zIndex: 10,
  },
});