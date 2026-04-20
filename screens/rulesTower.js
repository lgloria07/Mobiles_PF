import {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
/*  Conexion con fireStore */
import { auth, db } from '../services/firebase';
import { collection, doc, setDoc, updateDoc, arrayUnion, getDoc, arrayRemove, deleteDoc, } from 'firebase/firestore';
import { signOut as firebaseSignOut } from 'firebase/auth';

  export default function RulesTower({navigation, route}){
      const [mensaje,setMensaje] = useState('');
      const [activePlayers,setActivePlayers] = useState([]);

      //Seleccion de juegos
      const charades = () => {console.log("Charades")}
      const towerOfNerds = () => {navigation.navigate('rulesTower')}
      const taboo = () => {console.log("Taboo")}
      const whoAmI = () => {console.log("WhoAmI")}
      

      return (  
          <View style={styles.container}>

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
                  <Text>{activePlayers.join(", ")}</Text>
                </View>
              </View>
                
            </View>

              {/* Carta de juego*/}
              <View style={styles.container2}>
                  <View style={styles.container211}>
                    <View style={styles.container2111}>
                      <Image source={require('../Imagenes/who.jpg')}style={{width:"90%",height:"70%",marginTop:60,borderRadius:10,}}/>
                    </View>
                    <View style={styles.container2112}>
                      <Text style={{color:"white",fontWeight:"bold",fontSize:18,marginTop:-160}}>Who am I?</Text>
                    </View>
                  </View>

                  <View style={styles.container211}>
                    <View style={[styles.container2112, { height:"100%", paddingHorizontal:4, marginTop:-80, marginRight:6 }]}>
                      <Text style={{color:"white",fontSize:14,marginTop:-30,textAlign:"center"}}>You are going to be given a 
                        category. You’ll have to guess characters that fit the given category, 
                        if you guess right, you can guess again. If you guess your category incorrectly, 
                        you lose (be careful, you only have one attempt at doing so).</Text>

                      <View style={{borderColor:"white",width:"90%",borderWidth:0.2,marginTop:15}}></View>

                      <Text style={{color:"white",fontSize:13,marginTop:20}}>Number of players: 2 - 8</Text>
                      <Text style={{color:"white",fontSize:13,marginTop:20}}>Aprox time: 15 minutes</Text>

                    </View>
                  </View> 
                
              </View>

              {/* Boton Cerrar Sesión */}
              <TouchableOpacity style={styles.start}>
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
    container2:{
      height:"50%",
      width:"95%",
      flexDirection: "row",
      alignItems:"center",
      justifyContent:'center',
      borderRadius:20,
      backgroundColor:"#1F2937",
      borderRadius:10,
    },
    container211:{
      width:"50%",
      height:"100%",
      backgroundColor:"#03224d43",
      justifyContent:"center",
      alignItems:"center",
      borderRadius:10,
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
    start:{
      height:60,
      width:150,
      backgroundColor:'#33A548',
      borderRadius:10,
      marginTop:10,
      alignItems:'center',
      justifyContent:'center',
    },
  });
