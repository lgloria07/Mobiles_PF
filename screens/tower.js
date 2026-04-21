import { useState } from 'react';
import {StyleSheet,Text,View,Image,TouchableOpacity,ScrollView,TextInput,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase';
import usePartyPlayers from '../hooks/usePartyPlayers';

export default function TowerOfNerds({ navigation, route }) {
  const { code } = route.params;
  const { activePlayers } = usePartyPlayers(code);

  const currentUid = auth.currentUser?.uid;

  const [tower, setTower] = useState(['', '', '', '', '', '']);

  const updateTowerItem = (text, index) => {
    const updatedTower = [...tower];
    updatedTower[index] = text;
    setTower(updatedTower);
  };

  return (
    <View style={styles.container}>
      {/* Flecha regresar */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={26} color="white" />
      </TouchableOpacity>

      {/* Header fijo */}
      <View style={styles.header}>
        <Image
          source={require('../Imagenes/logo.png')}
          style={styles.logo}
        />

        <Text style={styles.title}>Tower of Nerds</Text>
      </View>

      {/* Scroll */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tabla de jugadores y categorías */}
        <View style={styles.playersContainer}>
          <View style={styles.playersHeader}>
            <Text style={styles.headerText}>Name</Text>
            <Text style={styles.headerText}>Category</Text>
          </View>

          {activePlayers.map((player) => (
            <View key={player.uid} style={styles.playerRow}>
              <Text
                style={[
                  styles.playerName,
                  player.uid === currentUid && styles.currentPlayer,
                ]}
              >
                {player.username}
                {player.uid === currentUid ? ' (You)' : ''}
              </Text>

              <Text style={styles.playerCategory}>
                {player.uid === currentUid ? '????' : player.category || '....' }
              </Text>
            </View>
          ))}
        </View>

        {/* Torre */}
        <View style={styles.towerContainer}>
          <Text style={styles.towerTitle}>YOUR TOWER</Text>

          <View style={styles.tower}>
            {tower.map((item, index) => (
              <TextInput key={index} style={styles.towerInput}value={item}
                onChangeText={(text) => updateTowerItem(text, index)}
                placeholder={`Character ${index + 1}`}
                placeholderTextColor="#94A3B8"
              />
            ))}
          </View>
        </View>

        {/* Botón Guess */}
        <TouchableOpacity style={styles.guessButton}>
          <Text style={styles.guessButtonText}>Guess</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: '#ffffff20',
    padding: 8,
    borderRadius: 50,
  },

  header: {
    width: '100%',
    alignItems: 'center',
    marginTop: 55,
    marginBottom: 10,
  },

  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: -10,
  },

  title: {
    color: '#34D36E',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: -5,
  },

  scrollContent: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 40,
  },

  playersContainer: {
    width: '90%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 15,
    marginBottom: 25,
  },

  playersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff20',
  },

  headerText: {
    color: '#5FBA80',
    fontSize: 15,
    fontWeight: 'bold',
    width: '48%',
  },

  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  playerName: {
    color: 'white',
    fontSize: 14,
    width: '48%',
  },

  currentPlayer: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },

  playerCategory: {
    color: '#C2C6CE',
    fontSize: 14,
    width: '48%',
  },

  towerContainer: {
    width: '90%',
    alignItems: 'center',
  },

  towerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  tower: {
    width: '75%',
  },

  towerInput: {
    width: '100%',
    height: 50,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: 'bold',
  },

  guessButton: {
    marginTop: 30,
    width: 130,
    height: 45,
    backgroundColor: '#33A548',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  guessButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});