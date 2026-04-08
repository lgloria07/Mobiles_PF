import {useState} from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
/*  Conexion con fireStore */
import { auth, db } from '../services/firebase';
import { collection, doc, setDoc, updateDoc, arrayUnion, getDoc, arrayRemove, deleteDoc, } from 'firebase/firestore';
import { signOut as firebaseSignOut } from 'firebase/auth';

export default function PartyScreen({navigation}) {
    const [mensaje,setMensaje] = useState('');
    const [partyCode,setPartyCode] = useState('');
    const [currentParty, setCurrentParty] = useState(null);

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
            if (!currentParty) return;

            const partyRef = doc(db, "parties", currentParty);
            const partySnap = await getDoc(partyRef);

            if (!partySnap.exists()) return;

            // Quitar usuario
            await updateDoc(partyRef, {
            members: arrayRemove(user.uid)
            });

            const updatedSnap = await getDoc(partyRef);
            if (!updatedSnap.exists()) return;

            const updatedData = updatedSnap.data();

            // Borrar la party si ya no tiene miembros
            if (!updatedData.members || updatedData.members.length === 0) {
            await deleteDoc(partyRef);
            }

        } catch (error) {
            console.log(error);
        }
    };

    const joinParty = async () => {
        try {
            const user = auth.currentUser;

            if (!partyCode) {
                setMensaje("Enter a party code");
                return;
            }

            const partyRef = doc(db, "parties", partyCode.toUpperCase());
            const partySnap = await getDoc(partyRef);

            if (!partySnap.exists()) {
                setMensaje("Party not found");
                return;
            }

            const data = partySnap.data();

            if(data.members.length>=5){
                setMensaje("Max number of players reached");
                return;
            }

            await updateDoc(partyRef, {
                members: arrayUnion(user.uid)
            });
            
            let code = partyCode.toUpperCase();
            setCurrentParty(code);
            navigation.navigate('gameSelection',{code});

        } catch (error) {
            console.log(error);
            setMensaje("Error joining party");
        }
        };

    const createParty = async () => {
        try {
            const user = auth.currentUser;

            let code;
            let partySnap;

            do {
                code = Math.random().toString(36).substring(2, 8).toUpperCase();
                const partyRef = doc(db, "parties", code);
                partySnap = await getDoc(partyRef);
            } while (partySnap.exists());

            await setDoc(doc(db, "parties", code), {
                code: code,
                host: user.uid,
                members: [user.uid],
                createdAt: new Date()
            });

            setCurrentParty(code);
            navigation.navigate('gameSelection',{code});

        } catch (error) {
            setMensaje("Error creating party");
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
          <Text style={styles.subtitle}>Join the party</Text>
        </View>
      </View>

      {/* Mensaje de confirmación */}
      <View style={styles.messageContainer}>
        <Text style={{color:'#e62424',fontSize:14,textAlign:"center"}}>{mensaje}</Text>
      </View>

      {/* Party Code */}
      <View style={styles.container2}>
        <View style={styles.container21}>
          <Text style={styles.subtitulo}>Party Code</Text>
        </View>
        <View style={styles.container22}>
          <TextInput 
          style={styles.inputUser} 
          placeholder="ABCDEFGHIJ" 
          placeholderTextColor="#a4abb9"
          value={partyCode} 
          onChangeText={setPartyCode}>
          </TextInput>
        </View>
      </View>

      {/* Boton Unirse a fiesta */}
      <TouchableOpacity onPress={joinParty} style={styles.join}>
        <Text style={{color:'white',fontSize:17,fontWeight:'bold'}}>Join the Party!</Text>
      </TouchableOpacity>

      {/* Boton Crear fiesta */}
      <TouchableOpacity onPress={createParty} style={styles.create}>
        <Text style={{color:'white',fontSize:15,fontWeight:'bold'}}>Create a Party</Text>
      </TouchableOpacity>

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
  signOut:{
    height:40,
    width:150,
    backgroundColor:'#863535',
    borderRadius:10,
    marginTop:140,
    alignItems:'center',
    justifyContent:'center',
  },
});