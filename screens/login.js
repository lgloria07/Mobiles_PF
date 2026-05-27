import {useState, useContext } from 'react';
import {StyleSheet,Text,View,Image,TextInput,TouchableOpacity} from 'react-native';

/* Conexion con firebase */
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { auth } from '../services/firebase'; 

/* Para el icono de settings */
import { Ionicons } from '@expo/vector-icons';

/* Usado para saber el idioma y tamaño de letra */
import { SettingsContext } from '../services/SettingsContext';

export default function LoginScreen({ navigation }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const {language,textSize,titleSize} = useContext(SettingsContext); 

  /* Traducciones */
  const texts = {
    English: {
      title: 'Party Games',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      noAccount: 'Dont have an account?',
      signUp: 'Sign Up',

      fillFields: 'Please fill all fields',
      userNotFound: 'User not found',
      wrongPassword: 'Incorrect password',
      invalidEmail: 'Invalid email format',
      incorrectLogin: 'Incorrect email or password',
    },

    Español: {
      title: 'Juegos de Fiesta',
      email: 'Correo',
      password: 'Contraseña',
      signIn: 'Ingresar',
      noAccount: '¿No tienes cuenta?',
      signUp: 'Registrarse',

      fillFields: 'Por favor completa todos los campos',
      userNotFound: 'Usuario no encontrado',
      wrongPassword: 'Contraseña incorrecta',
      invalidEmail: 'Formato de correo inválido',
      incorrectLogin: 'Correo o contraseña incorrectos',
    },

    Français: {
      title: 'Jeux de Fête',
      email: 'Email',
      password: 'Mot de passe',
      signIn: 'Connexion',
      noAccount: 'Vous navez pas de compte?',
      signUp: 'Créer un compte',

      fillFields: 'Veuillez remplir tous les champs',
      userNotFound: 'Utilisateur introuvable',
      wrongPassword: 'Mot de passe incorrect',
      invalidEmail: 'Format demail invalide',
      incorrectLogin: 'Email ou mot de passe incorrect',
    },

    中文: {
      title: '派对游戏',
      email: '邮箱',
      password: '密码',
      signIn: '登录',
      noAccount: '没有账户？',
      signUp: '注册',

      fillFields: '请填写所有字段',
      userNotFound: '未找到用户',
      wrongPassword: '密码错误',
      invalidEmail: '邮箱格式无效',
      incorrectLogin: '邮箱或密码错误',
    }
  };

  // Funcion para iniciar sesión 
  const Ingresar = async () => {
    setMensaje("");

    if (!email || !password) { //Si no se llenan los campos
      setMensaje(texts[language].fillFields);
      return;
    }

    try {

      await signInWithEmailAndPassword(auth,email,password); 
      //Await espera hasta que esto suceda

      navigation.navigate('party'); //Si todo esta bien, pasamos a la pantalla de party

    } catch (error) {

      switch (error.code) {

        case "auth/user-not-found":
          setMensaje(texts[language].userNotFound); //Si no hay usuario
          break;

        case "auth/wrong-password":
          setMensaje(texts[language].wrongPassword); //Si la contaseña es incorrecta
          break;

        case "auth/invalid-email":
          setMensaje(texts[language].invalidEmail); //Si el formato del correo es invalido
          break;

        default:
          setMensaje(texts[language].incorrectLogin); //Mensaje generico
          break;
      }
    }
  };

  return (

    <View style={styles.container}>

      {/* Boton Settings, para cambiar la configuracion de idioma y tamaño de letra */}
      <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('settings')}>
        <Ionicons name="settings-outline" size={30} color="white"/>
      </TouchableOpacity>

      {/* Logo y Titulo */}
      <View style={styles.container1}>

        <View style={styles.container11}>
          <Image source={require('../Imagenes/logo.png')} style={{ width: "100%", height: "100%" }}/>
        </View>

        <View style={styles.container12}>

          <Text style={[styles.title,{ fontSize: titleSize }]}>
            Green Monster
          </Text>

          <Text style={[styles.subtitle,{ fontSize: textSize }]}>
            {texts[language].title}
          </Text>

        </View>

      </View>

      {/* Mensaje */}
      <View style={styles.messageContainer}>
        <Text style={{color: '#e62424',fontSize: textSize,textAlign: "center"}}>
          {mensaje}
        </Text>
      </View>

      {/* Email */}
      <View style={styles.container2}>

        <View style={styles.container21}>
          <Text style={[styles.subtitulo,{ fontSize: textSize }]}>
            {texts[language].email}
          </Text>
        </View>

        <View style={styles.container22}>
          <TextInput style={styles.inputUser} placeholder="example@gmail.com" 
          placeholderTextColor="#a4abb9"value={email} onChangeText={setEmail}/>
        </View>

      </View>

      {/* Password */}
      <View style={styles.container3}>

        <View style={styles.container21}>
          <Text style={[styles.subtitulo,{ fontSize: textSize }]}>
            {texts[language].password}
          </Text>
        </View>

        <View style={styles.container22}>
          <TextInput style={styles.inputUser} placeholder="................" placeholderTextColor="#a4abb9"
            value={password} onChangeText={setPassword} secureTextEntry={true}/>
        </View>

      </View>

      {/* Boton Ingresar */}
      <TouchableOpacity
        onPress={Ingresar}
        style={styles.ingresar}
      >
        <Text style={{color: 'white', fontSize: textSize, fontWeight: 'bold'}}>
          {texts[language].signIn}
        </Text>
      </TouchableOpacity>

      {/* Registro */}
      <Text style={{marginTop: 80,color: '#e2eee7',fontWeight: 'bold',fontSize: textSize,}}>
        {texts[language].noAccount}
      </Text>

      <TouchableOpacity onPress={() => navigation.navigate('register')}>
        <Text style={{ color: '#33A548', fontWeight: 'bold', fontSize: textSize,}}>
          {texts[language].signUp}
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
    height: 240,
    width: "90%",
    marginTop: 100,
  },

  container11: {
    height: "70%",
  },

  container12: {
    height: "30%",
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: -30,
  },

  messageContainer: {
    width: "80%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: '#22C55E',
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#e2eee7',
    fontWeight: 'bold',
  },

  container2: {
    height: 90,
    width: "80%",
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

  ingresar: {
    height: 50,
    width: 200,
    backgroundColor: '#33A548',
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 25,
    zIndex: 10,
  },
});