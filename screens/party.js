import { useState, useContext } from 'react';
import {StyleSheet,Text,View,Image,TextInput,TouchableOpacity} from 'react-native';

/* Conexion con fireStore */
import { auth, db } from '../services/firebase';
import {doc,setDoc,updateDoc,arrayUnion,getDoc,arrayRemove,deleteDoc,} from 'firebase/firestore';
import { signOut as firebaseSignOut } from 'firebase/auth';

import { Ionicons } from '@expo/vector-icons';

import { SettingsContext } from '../services/SettingsContext';

export default function PartyScreen({ navigation }) {

  const [mensaje, setMensaje] = useState('');
  const [partyCode, setPartyCode] = useState('');
  const [currentParty, setCurrentParty] = useState(null);

  const {language,textSize,titleSize} = useContext(SettingsContext);

  /* Traducciones */
  const texts = {

    English: {
      subtitle: 'Join the party',

      partyCode: 'Party Code',

      joinParty: 'Join the Party!',
      createParty: 'Create a Party',
      signOut: 'Sign Out',

      enterCode: 'Enter a party code',
      partyNotFound: 'Party not found',
      maxPlayers: 'Max number of players reached',
      joinError: 'Error joining party',
      createError: 'Error creating party',
    },

    Español: {
      subtitle: 'Únete a la fiesta',

      partyCode: 'Código de Fiesta',

      joinParty: '¡Unirse a la Fiesta!',
      createParty: 'Crear una Fiesta',
      signOut: 'Cerrar Sesión',

      enterCode: 'Ingresa un código',
      partyNotFound: 'Fiesta no encontrada',
      maxPlayers: 'Número máximo de jugadores alcanzado',
      joinError: 'Error al unirse a la fiesta',
      createError: 'Error al crear la fiesta',
    },

    Français: {
      subtitle: 'Rejoindre la fête',

      partyCode: 'Code de Fête',

      joinParty: 'Rejoindre la fête!',
      createParty: 'Créer une fête',
      signOut: 'Déconnexion',

      enterCode: 'Entrez un code',
      partyNotFound: 'Fête introuvable',
      maxPlayers: 'Nombre maximum de joueurs atteint',
      joinError: 'Erreur lors de la connexion',
      createError: 'Erreur lors de la création',
    },

    中文: {
      subtitle: '加入派对',

      partyCode: '派对代码',

      joinParty: '加入派对！',
      createParty: '创建派对',
      signOut: '退出登录',

      enterCode: '请输入派对代码',
      partyNotFound: '未找到派对',
      maxPlayers: '已达到最大玩家数量',
      joinError: '加入派对时出错',
      createError: '创建派对时出错',
    }
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
      if (!user) return; // Si no hay usuario, no hacemos nada
      const partyRef = doc(db, "parties", currentParty); // Obtenemos la referencia de la fiesta actual
      await updateDoc(partyRef, {
        members: arrayRemove(user.uid) // Removemos al usuario de la lista 
      });
      const updatedSnap = await getDoc(partyRef); // Obtenemos la fiesta actualizada
      if (!updatedSnap.exists()) return; // Si la fiesta ya no existe, no hacemos nada
      const updatedData = updatedSnap.data(); // Obtenemos los datos actualizados
      if (
        !updatedData.members ||
        updatedData.members.length === 0
      ) {
        await deleteDoc(partyRef); // Si no quedan miembros, eliminamos la fiesta
      }
    } catch (error) {
      console.log("leaveParty error:", error);
    }
  };

  const joinParty = async () => {

    try {
      const user = auth.currentUser;
      if (!partyCode) { 
        setMensaje(texts[language].enterCode);
        return;
      }
      const partyRef = doc(db,"parties",partyCode.toUpperCase());

      const partySnap = await getDoc(partyRef);

      if (!partySnap.exists()) {
        setMensaje(texts[language].partyNotFound);
        return;
      }

      const data = partySnap.data(); // Obtenemos los datos de la fiesta
      if (data.members.length >= 5) { //Solo permitimos 5 jugadores por fiesta
        setMensaje(texts[language].maxPlayers);
        return;
      }

      await updateDoc(partyRef, {members: arrayUnion(user.uid)}); // Agregamos al usuario a la lista de miembros

      let code = partyCode.toUpperCase();
      setCurrentParty(code);
      navigation.navigate('gameSelection', { code });
    } catch (error) {
      console.log(error);
      setMensaje(texts[language].joinError);
    }
  };

  const createParty = async () => {

    try {
      const user = auth.currentUser;
      let code; // Generamos un código único para la fiesta
      let partySnap; //Referencia de la fiesta

      do {
        code = Math.random() //Creamos un codigo aleatorio
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

        const partyRef = doc(db, "parties", code);

        partySnap = await getDoc(partyRef); // Verificamos si ya existe una fiesta con ese código

      } while (partySnap.exists()); // Hacemos esto hasta obtener un codigo nuevo

      await setDoc(doc(db, "parties", code), {
        code: code,
        host: user.uid,
        members: [user.uid],
        createdAt: new Date()
      });

      setCurrentParty(code);

      navigation.navigate('gameSelection', { code });

    } catch (error) {
      setMensaje(texts[language].createError);
    }
  };

  return (

    <View style={styles.container}>

      {/* Flecha return */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={26} color="white"/>
      </TouchableOpacity>

      {/* Logo y Titulo */}
      <View style={styles.container1}>

        <View style={styles.container11}>
          <Image source={require('../Imagenes/logo.png')} style={{ width: "100%", height: "100%" }}/>
        </View>

        <View style={styles.container12}>

          <Text style={[styles.title,{ fontSize: titleSize - 10 }]}>
            Green Monster
          </Text>

          <Text style={[ styles.subtitle,{ fontSize: textSize }]}>
            {texts[language].subtitle}
          </Text>

        </View>

      </View>

      {/* Mensaje */}
      <View style={styles.messageContainer}>

        <Text
          style={{color: '#e62424',fontSize: textSize,textAlign: "center"}}>
          {mensaje}
        </Text>

      </View>

      {/* Party Code */}
      <View style={styles.container2}>

        <View style={styles.container21}>
          <Text style={[styles.subtitulo,{ fontSize: textSize }]}>
            {texts[language].partyCode}
          </Text>
        </View>

        <View style={styles.container22}>

          <TextInput
            style={styles.inputUser}
            placeholder="ABCDEFGHIJ"
            placeholderTextColor="#a4abb9"
            value={partyCode}
            onChangeText={setPartyCode}
          />

        </View>

      </View>

      {/* Join */}
      <TouchableOpacity onPress={joinParty} style={styles.join}>
        <Text style={{ color: 'white', fontSize: textSize,fontWeight: 'bold'}}>
          {texts[language].joinParty}
        </Text>
      </TouchableOpacity>

      {/* Create */}
      <TouchableOpacity onPress={createParty} style={styles.create}>
        <Text style={{ color: 'white',fontSize: textSize,fontWeight: 'bold'}}>
          {texts[language].createParty}
        </Text>
      </TouchableOpacity>

      {/* Sign Out */}
      <TouchableOpacity onPress={signOut} style={styles.signOut}>
        <Text style={{color: 'white',fontSize: textSize,fontWeight: 'bold'}}>
          {texts[language].signOut}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  container1: {
    height: 100,
    width: "50%",
    marginTop: 100,
    marginBottom: 180,
  },

  container11: {
    height: "70%",
  },

  container12: {
    height: "30%",
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 30,
  },

  messageContainer: {
    width: "80%",
    marginTop: -55,
    marginBottom: -50,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: '#22C55E',
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#676E7A',
    fontWeight: 'bold',
  },

  container2: {
    height: 90,
    width: "80%",
    marginBottom: 20,
  },

  container21: {
    height: "35%",
    width: "100%",
  },

  container22: {
    height: "65%",
    width: "100%",
  },

  subtitulo: {
    color: '#e2eee7',
    fontWeight: 'bold',
  },

  inputUser: {
    borderWidth: 1,
    borderColor: '#0a1429',
    borderRadius: 15,
    backgroundColor: '#1E293B',
    height: "100%",
    width: "100%",
    color: '#e2eee7',
    paddingHorizontal: 10,
  },

  container3: {
    height: 90,
    width: "80%",
    marginTop: 10,
  },

  join: {
    height: 50,
    width: 300,
    backgroundColor: '#33A548',
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  create: {
    height: 40,
    width: 250,
    backgroundColor: '#3C6544',
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  signOut: {
    height: 40,
    width: 150,
    backgroundColor: '#863535',
    borderRadius: 10,
    marginTop: 100,
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
});