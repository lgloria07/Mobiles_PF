import {useState} from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
/*  Conexion con firebase */
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';


export default function LoginScreen({navigation}) {
const [email,setEmail] = useState('');
const [password,setPassword] = useState('');

/*  Funcion para iniciar sesión */
const Ingresar = async () => {

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("Logeado:", userCredential.user);

    navigation.navigate('register');

  } catch (error) {
    if (error.code === "auth/user-not-found") {
      alert("User not found");
    } else if (error.code === "auth/wrong-password") {
      alert("Incorrect password");
    } else {
      console.log(error.message);
    }
  }
};

  return (  
    <View style={styles.container}>

      {/* Logo y Titulo */}
      <View style={styles.container1}>
        <View style={styles.container11}>
          <Image source={require('../Imagenes/logo.png')}style={{width:"100%",height:"100%"}}/>
        </View>
        <View style={styles.container12}>
          <Text style={styles.title}>Green Monster</Text>
        </View>
      </View>

      {/* User */}
      <View style={styles.container2}>
        <View style={styles.container21}>
          <Text style={styles.subtitulo}>Email</Text>
        </View>
        <View style={styles.container22}>
          <TextInput 
          style={styles.inputUser} 
          placeholder="example@gmail.com" 
          placeholderTextColor="#a4abb9"
          value={email} 
          onChangeText={setEmail}>
          </TextInput>
        </View>
      </View>

      {/* Password */}
      <View style={styles.container3}>
        <View style={styles.container21}>
          <Text style={styles.subtitulo}>Password</Text>
        </View>
        <View style={styles.container22}>
          <TextInput 
            style={styles.inputUser} 
            placeholder="................" 
            placeholderTextColor="#a4abb9"
            value={password} 
            onChangeText={setPassword}
            secureTextEntry={true}>
          </TextInput>
        </View>
      </View>

      {/* Boton Ingresar */}
      <TouchableOpacity onPress={Ingresar} style={styles.ingresar}>
        <Text style={{color:'white',fontSize:17,fontWeight:'bold'}}>Sign In</Text>
      </TouchableOpacity>

      {/* Resgistrarse */}
      <Text style={{
        marginTop:80,
        color:'#e2eee7',
        fontWeight:'bold',
        fontSize:15,
      }}>Dont have an account?</Text>
      <TouchableOpacity onPress={()=> navigation.navigate('register')}>
        <Text style={{
            color:'#33A548',
            fontWeight:'bold',
            fontSize:14,
        }}>Sign Up</Text>
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
    height:240,
    width:"90%",
    marginTop:100,
  },
  container11:{
    height:"70%",
  },
  container12:{
    height:"30%",
    justifyContent:'flex-start',
    alignItems:'center',
    marginTop:-30,
  },
  title:{
    color:'#22C55E',
    fontSize:35,
    fontWeight:'bold',
  },
  container2:{
    height:90,
    width:"80%",
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
  ingresar:{
    height:50,
    width:200,
    backgroundColor:'#33A548',
    borderRadius:20,
    marginTop:20,
    alignItems:'center',
    justifyContent:'center',
  },
});