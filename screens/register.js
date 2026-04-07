import {useState} from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
/*  Conexion con firebase */
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function RegisterScreen({navigation}) {
  const [username,setUsername] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensaje,setMensaje] = useState('');

/*  Funcion para regsitrar un nuevo usuario */
const Registrar = async () => {
  setMensaje("");
  // Username
  if (username.length < 3) {
    setMensaje("Username must have at least 3 characters");
    return;
  }

  // Email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setMensaje("Invalid email format");
    return;
  }

  // Password regex
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!passwordRegex.test(password)) {
    setMensaje("Password must be at least 6 characters and include letters and numbers");
    return;
  }

  // Confirm password
  if (password !== confirmPassword) {
    setMensaje("Passwords do not match");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const userAuth = userCredential.user;

    await setDoc(doc(db, "users", userAuth.uid), {
      username: username,
      email: email,
      createdAt: new Date()
    });

    console.log("Usuario creado:", userAuth);

    navigation.navigate('login');

  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      setMensaje("Email already in use");
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
          <Text style={styles.title}>Create an Account</Text>
        </View>
      </View>

      {/* Mensaje de confirmación */}
      <View style={styles.messageContainer}>
        <Text style={{color:'#e62424',fontSize:14,textAlign:"center"}}>{mensaje}</Text>
      </View>

      {/* User */}
      <View style={styles.container2}>
        <View style={styles.container21}>
          <Text style={styles.subtitulo}>User</Text>
        </View>
        <View style={styles.container22}>
          <TextInput 
          style={styles.inputMail} 
          placeholder="username" 
          placeholderTextColor="#a4abb9"
          value={username} 
          onChangeText={setUsername}>
          </TextInput>
        </View>
      </View>

      {/* Email */}
      <View style={styles.container2}>
        <View style={styles.container21}>
          <Text style={styles.subtitulo}>Email</Text>
        </View>
        <View style={styles.container22}>
          <TextInput 
          style={styles.inputMail} 
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
            style={styles.inputMail} 
            placeholder="................" 
            placeholderTextColor="#a4abb9"
            value={password} 
            onChangeText={setPassword}
            secureTextEntry={true}>
          </TextInput>
        </View>
      </View>

      {/* Confirm Password */}
      <View style={styles.container3}>
        <View style={styles.container21}>
          <Text style={styles.subtitulo}>Confirm Password</Text>
        </View>
        <View style={styles.container22}>
          <TextInput 
            style={styles.inputMail} 
            placeholder="................" 
            placeholderTextColor="#a4abb9"
            value={confirmPassword} 
            onChangeText={setConfirmPassword}
            secureTextEntry={true}>
          </TextInput>
        </View>
      </View>

      {/* Boton Registrarse */}
      <TouchableOpacity onPress={Registrar} style={styles.ingresar}>
        <Text style={{color:'white',fontSize:17,fontWeight:'bold'}}>Sign Up</Text>
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
    marginTop:70,
  },
  container11:{
    height:"70%",
  },
  messageContainer:{
    width:"80%",
    marginTop:-55,
    marginBottom:20,
    alignItems:"center",
    justifyContent:"center",
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
  inputMail:{
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