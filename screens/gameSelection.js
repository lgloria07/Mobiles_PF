import {useState} from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';

export default function GameSelection({navigation, route}){
    const [mensaje,setMensaje] = useState('');
    const { code } = route.params;

    return (  
        <View style={styles.container}>

        {/* Logo y Titulo */}
        <View style={styles.container1}>
            <View style={styles.container11}>
            <Image source={require('../Imagenes/logo.png')}style={{width:"100%",height:"100%"}}/>
            </View>
            <View style={styles.container12}>
            <Text style={styles.title}>Green Monster</Text>
            <Text style={styles.subtitle}>Join the party</Text>
            </View>
        </View>

        {/* Mensaje de confirmación */}
        <View style={styles.messageContainer}>
            <Text style={{color:'#e62424',fontSize:14,textAlign:"center"}}>{mensaje}</Text>
        </View>
        <Text>{code}</Text>
        
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
    height:100,
    width:"50%",
    marginTop:100,
    marginBottom:180,
  },
  container11:{
    height:"70%",
  },
  container12:{
    height:"30%",
    justifyContent:'flex-start',
    alignItems:'center',
    marginTop:-10,
    marginBottom:30,
  },
  messageContainer:{
    width:"80%",
    marginTop:-55,
    marginBottom:20,
    alignItems:"center",
    justifyContent:"center",
  },
  title:{
    color:'#22C55E',
    fontSize:18,
    fontWeight:'bold',
  },
  subtitle:{
    color:'#676E7A',
    fontSize:14,
    fontWeight:'bold',
  },
  container2:{
    height:90,
    width:"80%",
    marginBottom:20,
  },
  container21:{
    height:"35%",
    width:"100%",
  },
  container22:{
    height:"65%",
    width:"100%",
  },
  subtitulo:{
    color:'#e2eee7',
    fontWeight:'bold',
    fontSize:17,
  },
  inputUser:{
    borderWidth:1,
    borderColor:'#0a1429',
    borderRadius:15,
    backgroundColor:'#1d2a49',
    height:"100%",
    width:"100%",
    color:'#e2eee7',
    paddingHorizontal: 10,
  },
  container3:{
    height:90,
    width:"80%",
    marginTop:10,
  },
  join:{
    height:50,
    width:300,
    backgroundColor:'#33A548',
    borderRadius:10,
    marginTop:20,
    alignItems:'center',
    justifyContent:'center',
  },
  create:{
    height:40,
    width:250,
    backgroundColor:'#3C6544',
    borderRadius:10,
    marginTop:20,
    alignItems:'center',
    justifyContent:'center',
  },
});
