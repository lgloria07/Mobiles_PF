import {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
/*  Conexion con fireStore */
import { auth, db } from '../services/firebase';
import { collection, doc, setDoc, updateDoc, arrayUnion, getDoc, arrayRemove, deleteDoc, } from 'firebase/firestore';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

  export default function GameSelection({navigation, route}){
      const [mensaje,setMensaje] = useState('');
      const { code } = route.params;
      const [activePlayers,setActivePlayers] = useState([]);

      //Seleccion de juegos
      const charades = () => {console.log("Charades")}
      const towerOfNerds = () => {navigation.navigate('rulesTower')}
      const taboo = () => {console.log("Taboo")}
      const whoAmI = () => {console.log("WhoAmI")}

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

          if (!updatedData.members || updatedData.members.length === 0) {
            await deleteDoc(partyRef);
          }

        } catch (error) {
          console.log("leaveParty error:", error);
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
                <Text style={styles.subtitle}>Select a game</Text>
              </View>

              {/* Jugadores Activos */}
              <View style={styles.container12}>
                <View style={styles.container121}>
                  <Text style={{fontWeight:'bold',fontSize:13}}>Active Players</Text>
                </View>
                <View style={styles.container122}>
                  <Text>{activePlayers.join(", ")}</Text>
                </View>
              </View>
                
            </View>

              {/* Código de Sala */}
              <Text style={styles.code}>Party Code: {code}</Text>

              {/* Juegos disponibles*/}
              <View style={styles.container2}>
                <View style={styles.container21}>
                  <View style={styles.container211}>
                    <View style={styles.container2111}>
                      <Image source={require('../Imagenes/charades.png')}style={styles.image}/>
                    </View>
                    <View style={styles.container2112}>
                      <Text style={{color:"white",fontWeight:"bold",fontSize:18,marginTop:-30}}>Charades</Text>
                      {/* Boton Unirse a fiesta */}
                        <TouchableOpacity onPress={charades} style={styles.join}>
                          <Text style={{color:'white',fontSize:14,fontWeight:'bold'}}>Play</Text>
                        </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.container211}>
                    <View style={styles.container2111}>
                      <Image source={require('../Imagenes/tower.png')}style={styles.image}/>
                    </View>
                    <View style={styles.container2112}>
                      <Text style={{color:"white",fontWeight:"bold",fontSize:18,marginTop:-30}}>Tower of nerds</Text>
                      {/* Boton Unirse a fiesta */}
                        <TouchableOpacity onPress={towerOfNerds} style={styles.join}>
                          <Text style={{color:'white',fontSize:14,fontWeight:'bold'}}>Play</Text>
                        </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={styles.container21}>
                  <View style={styles.container211}>
                    <View style={styles.container2111}>
                      <Image source={require('../Imagenes/taboo.png')}style={styles.image}/>
                    </View>
                    <View style={styles.container2112}>
                      <Text style={{color:"white",fontWeight:"bold",fontSize:18,marginTop:-30}}>Taboo</Text>
                      {/* Boton Unirse a fiesta */}
                        <TouchableOpacity onPress={taboo} style={styles.join}>
                          <Text style={{color:'white',fontSize:14,fontWeight:'bold'}}>Play</Text>
                        </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.container211}>
                    <View style={styles.container2111}>
                      <Image source={require('../Imagenes/who.png')}style={styles.image}/>
                    </View>
                    <View style={styles.container2112}>
                      <Text style={{color:"white",fontWeight:"bold",fontSize:18,marginTop:-30}}>Who am I?</Text>
                      {/* Boton Unirse a fiesta */}
                        <TouchableOpacity onPress={whoAmI} style={styles.join}>
                          <Text style={{color:'white',fontSize:14,fontWeight:'bold'}}>Play</Text>
                        </TouchableOpacity>
                    </View>
                  </View>
                </View>
                
              </View>

              {/* Boton Cerrar Sesión */}
              <TouchableOpacity onPress={signOut} style={styles.signOut}>
                <Text style={{color:'white',fontSize:13,fontWeight:'bold'}}>Sign Out</Text>
              </TouchableOpacity>
          
          </View>
      );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: '#0F172A',
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
      position: "relative", //todo sigue normal, pero es necesario para poder usar el index z
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
    code:{
      color:'#C2C6CE',
      fontSize:14,
      marginBottom:5,
    },
    image:{
      height:"80%",
      width:"80%",
      borderWidth:0.2,
      borderColor:"white",
      borderRadius:10,
    },
    container2:{
      height:"60%",
      width:"100%",
      flexDirection:"column",
      alignItems:"center",
      justifyContent:'center',
    },
    container21:{
      width:"100%",
      height:"50%",
      flexDirection:"row",
      alignItems:"center",
      justifyContent:'space-around',
    },
    container211:{
      width:"45%",
      height:"90%",
      backgroundColor:"#1E293B",
      borderRadius:20,
    },
    container2111:{
      width:"100%",
      height:"60%",
      alignItems:"center",
      justifyContent:"center",
    },
    container2112:{
      width:"100%",
      height:"40%",
      alignItems:"center",
      justifyContent:"center",
    },
    signOut:{
      height:40,
      width:150,
      backgroundColor:'#863535',
      borderRadius:10,
      marginTop:10,
      alignItems:'center',
      justifyContent:'center',
    },
    join:{
    height:"35%",
    width:"70%",
    backgroundColor:'#33A548',
    borderRadius:8,
    marginTop:10,
    alignItems:'center',
    justifyContent:'center',
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
