import {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
/*  Conexion con fireStore */
import { auth, db } from '../services/firebase';
import { collection, doc, setDoc, updateDoc, arrayUnion, getDoc, arrayRemove, deleteDoc} from 'firebase/firestore';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { charactersWho } from '../data/charactersWho';
//Import hooks
import usePartyPlayers from '../hooks/usePartyPlayers';

  export default function RulesWhoAmI({navigation, route}){
      const [mensaje,setMensaje] = useState('');

      //Jugadores activos
      const { code } = route.params;
      const { activePlayers } = usePartyPlayers(code);
      const currentUid = auth.currentUser?.uid;

      const startGame = async () => {
        try {
          const partyRef = doc(db, 'parties', code);
          const partySnap = await getDoc(partyRef);

          if (!partySnap.exists()) return;

          const data = partySnap.data();
          const members = data.members || [];

          // Mezclar personajes
          const shuffled = [...charactersWho].sort(() => 0.5 - Math.random());

          // Tomar 30
          const selectedCharacters = shuffled.slice(0, 30);

          // Asignar 1 personaje a cada jugador
          for (let i = 0; i < members.length; i++) {
            const uid = members[i];

            const playerRef = doc(db, 'parties', code, 'players', uid);

            await setDoc(playerRef, {
              character: selectedCharacters[i % selectedCharacters.length]
            }, { merge: true });
          }

          // Guardar pool global (para mostrar opciones)
          await updateDoc(partyRef, {
            status: 'in_progress',
            game: 'whoami',
            charactersPool: selectedCharacters
          });

          navigation.navigate('whoAmI', { code });

        } catch (error) {
          console.error('Error starting game: ', error);
        }
      };

      return (  
          <View style={styles.container}>

            {/* Flecha return */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>

            {/* Logo y Titulo */}
            <View style={styles.container1}>
              <View style={styles.container11}>
                <Image source={require('../Imagenes/logo.png')}style={{width:"100%",height:"60%"}}/>
                <Text style={styles.title}>Green Monster</Text>
                <Text style={styles.subtitle}>Tower Of Nerds - Rules</Text>
              </View>

              {/* Jugadores Activos */}
              <View style={styles.container12}>
                <View style={styles.container121}>
                  <Text style={{fontWeight:'bold',fontSize:13}}>Active Players</Text>
                </View>
                <View style={styles.container122}>
                  <View style={{flexDirection: 'column', marginTop: 8}}>
                    {activePlayers.map((player) => (
                      <Text
                        key={player.uid}
                        style={{
                          color: player.isHost ? '#863535' : 'white',
                          fontWeight: 'bold',
                          fontSize: 12,
                        }}
                      >
                        {player.username}
                        {player.uid === currentUid ? " (You)" : ""}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
                
            </View>

              {/* Carta de juego*/}
              <View style={styles.container2}>
                {/* LEFT */}
                <View style={styles.left}>
                  <Image 
                    source={require('../Imagenes/who.png')} 
                    style={styles.image}
                  />
                  <Text style={styles.gameTitle}>Who Am I?</Text>
                </View>

                {/* RIGHT */}
                <View style={styles.right}>
                  <Text style={styles.rules}>
                    You are going to be given a character from a list of possible options.
                    Ask yes or no questions to figure out which character you are.
                    {"\n\n"}
                    You can only guess your character one time, so make sure you are completely sure before answering.
                  </Text>

                  <View style={styles.line} />

                  <Text style={styles.info}>Number of players: 2 - 5</Text>
                  <Text style={styles.info}>Approx time: 10 minutes</Text>
                </View>

              </View>

              {/* Boton Cerrar Sesión */}
              <TouchableOpacity onPress={startGame} style={styles.start}>
                <Text style={{color:'white',fontSize:20,fontWeight:'bold'}}>Start</Text>
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
    container111:{
      height:"30%",
      width:"50%",
      justifyContent:'flex-start',
      alignItems:'center',
      marginTop:-10,
      marginBottom:30,
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
      fontSize:15,
      fontWeight:'bold',
    },
    subtitle:{
      color:'#676E7A',
      fontSize:11,
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
      fontSize:15,
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
    info: {
      color: "#C2C6CE",
      fontSize: 12,
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
    }
  });
