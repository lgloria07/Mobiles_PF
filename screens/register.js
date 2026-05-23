import { useState, useContext } from 'react';

import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity
} from 'react-native';

/* Conexion con firebase */
import { createUserWithEmailAndPassword } from 'firebase/auth';

import { auth } from '../services/firebase';

import { doc, setDoc } from 'firebase/firestore';

import { db } from '../services/firebase';

import { SettingsContext } from '../services/SettingsContext';

export default function RegisterScreen({ navigation }) {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const {
    language,
    textSize,
    titleSize
  } = useContext(SettingsContext);

  /* Traducciones */
  const texts = {

    English: {
      title: 'Create an Account',

      username: 'User',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',

      register: 'Register',

      alreadyAccount: 'Already have an account?',
      signIn: 'Sign In',

      usernameError: 'Username must have at least 3 characters',
      emailError: 'Invalid email format',
      passwordError: 'Password must be at least 6 characters and include letters and numbers',
      confirmError: 'Passwords do not match',
      emailUsed: 'Email already in use',
    },

    Español: {
      title: 'Crear una Cuenta',

      username: 'Usuario',
      email: 'Correo',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',

      register: 'Registrarse',

      alreadyAccount: '¿Ya tienes una cuenta?',
      signIn: 'Ingresar',

      usernameError: 'El usuario debe tener al menos 3 caracteres',
      emailError: 'Formato de correo inválido',
      passwordError: 'La contraseña debe tener al menos 6 caracteres y contener letras y números',
      confirmError: 'Las contraseñas no coinciden',
      emailUsed: 'El correo ya está en uso',
    },

    Français: {
      title: 'Créer un Compte',

      username: 'Utilisateur',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',

      register: 'Créer un compte',

      alreadyAccount: 'Vous avez déjà un compte?',
      signIn: 'Connexion',

      usernameError: 'Le nom doit contenir au moins 3 caractères',
      emailError: 'Format demail invalide',
      passwordError: 'Le mot de passe doit contenir au moins 6 caractères avec lettres et chiffres',
      confirmError: 'Les mots de passe ne correspondent pas',
      emailUsed: 'Email déjà utilisé',
    },

    中文: {
      title: '创建账户',

      username: '用户名',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',

      register: '注册',

      alreadyAccount: '已经有账户？',
      signIn: '登录',

      usernameError: '用户名至少需要3个字符',
      emailError: '邮箱格式无效',
      passwordError: '密码至少需要6个字符并包含字母和数字',
      confirmError: '密码不匹配',
      emailUsed: '邮箱已被使用',
    }
  };

  /* Funcion para registrar usuario */
  const Registrar = async () => {

    setMensaje("");

    /* Username */
    if (username.length < 3) {
      setMensaje(texts[language].usernameError);
      return;
    }

    /* Email regex */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setMensaje(texts[language].emailError);
      return;
    }

    /* Password regex */
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

    if (!passwordRegex.test(password)) {
      setMensaje(texts[language].passwordError);
      return;
    }

    /* Confirm password */
    if (password !== confirmPassword) {
      setMensaje(texts[language].confirmError);
      return;
    }

    try {

      const userCredential =
        await createUserWithEmailAndPassword(
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

      navigation.navigate('login');

    } catch (error) {

      if (error.code === "auth/email-already-in-use") {

        setMensaje(texts[language].emailUsed);

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
          <Image
            source={require('../Imagenes/logo.png')}
            style={{ width: "100%", height: "100%" }}
          />
        </View>

        <View style={styles.container12}>

          <Text
            style={[
              styles.title,
              { fontSize: titleSize }
            ]}
          >
            {texts[language].title}
          </Text>

        </View>

      </View>

      {/* Mensaje */}
      <View style={styles.messageContainer}>

        <Text
          style={{
            color: '#e62424',
            fontSize: textSize,
            textAlign: "center"
          }}
        >
          {mensaje}
        </Text>

      </View>

      {/* User */}
      <View style={styles.container2}>

        <View style={styles.container21}>
          <Text
            style={[
              styles.subtitulo,
              { fontSize: textSize }
            ]}
          >
            {texts[language].username}
          </Text>
        </View>

        <View style={styles.container22}>
          <TextInput
            style={styles.inputMail}
            placeholder="username"
            placeholderTextColor="#a4abb9"
            value={username}
            onChangeText={setUsername}
          />
        </View>

      </View>

      {/* Email */}
      <View style={styles.container2}>

        <View style={styles.container21}>
          <Text
            style={[
              styles.subtitulo,
              { fontSize: textSize }
            ]}
          >
            {texts[language].email}
          </Text>
        </View>

        <View style={styles.container22}>
          <TextInput
            style={styles.inputMail}
            placeholder="example@gmail.com"
            placeholderTextColor="#a4abb9"
            value={email}
            onChangeText={setEmail}
          />
        </View>

      </View>

      {/* Password */}
      <View style={styles.container3}>

        <View style={styles.container21}>
          <Text
            style={[
              styles.subtitulo,
              { fontSize: textSize }
            ]}
          >
            {texts[language].password}
          </Text>
        </View>

        <View style={styles.container22}>
          <TextInput
            style={styles.inputMail}
            placeholder="................"
            placeholderTextColor="#a4abb9"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
        </View>

      </View>

      {/* Confirm Password */}
      <View style={styles.container3}>

        <View style={styles.container21}>
          <Text
            style={[
              styles.subtitulo,
              { fontSize: textSize }
            ]}
          >
            {texts[language].confirmPassword}
          </Text>
        </View>

        <View style={styles.container22}>
          <TextInput
            style={styles.inputMail}
            placeholder="................"
            placeholderTextColor="#a4abb9"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
          />
        </View>

      </View>

      {/* Boton Register */}
      <TouchableOpacity
        onPress={Registrar}
        style={styles.ingresar}
      >
        <Text
          style={{
            color: 'white',
            fontSize: textSize,
            fontWeight: 'bold'
          }}
        >
          {texts[language].register}
        </Text>
      </TouchableOpacity>

      {/* Login */}
      <Text
        style={{
          marginTop: 10,
          color: '#e2eee7',
          fontWeight: 'bold',
          fontSize: textSize,
        }}
      >
        {texts[language].alreadyAccount}
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('login')}
      >
        <Text
          style={{
            color: '#33A548',
            fontWeight: 'bold',
            fontSize: textSize,
          }}
        >
          {texts[language].signIn}
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
    marginTop: 70,
  },

  container11: {
    height: "70%",
  },

  messageContainer: {
    width: "80%",
    marginTop: -55,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  container12: {
    height: "30%",
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: -30,
  },

  title: {
    color: '#22C55E',
    fontWeight: 'bold',
    textAlign: 'center',
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

  inputMail: {
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
    borderRadius: 16,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
});