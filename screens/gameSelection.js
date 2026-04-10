import {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
/*  Conexion con fireStore */
import { auth, db } from '../services/firebase';
import { collection, doc, setDoc, updateDoc, arrayUnion, getDoc, arrayRemove, deleteDoc, } from 'firebase/firestore';
import { signOut as firebaseSignOut } from 'firebase/auth';

  export default function GameSelection({navigation, route}){
      const [mensaje,setMensaje] = useState('');
      const { code } = route.params;
      const [activePlayers,setActivePlayers] = useState([]);
      

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
      backgroundColor: '#131B2D',
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
      backgroundColor:"#5acb84",
      alignItems:"center",
      justifyContent:'center',
      position: "relative",
      zIndex: 2,
    },
    container122:{
      width:"80%",
      height:"80%",
      backgroundColor:"#D9D9D9",
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
    },
    container2:{
      height:"60%",
      width:"100%",
      borderColor:'white',
      borderWidth:2,
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
  });
