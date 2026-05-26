// Importamos la librería que nos permite navegar entre pantallas
import { NavigationContainer } from '@react-navigation/native'; //Aqui se guarda la pantalla que actualmente esta abierta
import { createNativeStackNavigator } from '@react-navigation/native-stack'; //Pila de pantallas abiertas
//Import de todas las pantallas
import LoginScreen from './screens/login';
import RegisterScreen from './screens/register';
import PartyScreen from './screens/party';
import GameSelection from './screens/gameSelection'
import RulesTower from './screens/rulesTower';
import RulesCharades from './screens/rulesCharades';
import RulesWhoAmI from './screens/rulesWhoAmI';
import RulesTaboo from './screens/rulesTaboo';
import Tower from './screens/tower';
import WhoAmI from './screens/whoAmI';
import Charades from './screens/Charades';
import Taboo from './screens/Taboo';
import SettingsScreen from './screens/SettingsScreen';
// Nos permite manejar un estado global para las configuraciones de la aplicación (osea que en cualquier pantalla podemos navegar)
import { SettingsProvider } from './services/SettingsContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
  <SettingsProvider>
    <NavigationContainer>
        {/* Definimos una ruta inicial */}
        <Stack.Navigator 
          initialRouteName="login"
          screenOptions={{ headerShown: false }}>

        {/* Cada uno de los stack screens se tiene que crear para poder navegar, necesita un nombre y el componente al que se navega. */}
        <Stack.Screen 
          name="login" 
          component={LoginScreen} 
        />

        <Stack.Screen 
          name="register" 
          component={RegisterScreen} 
        />

        <Stack.Screen
        name="party"
        component={PartyScreen}
        />

        <Stack.Screen
        name="gameSelection"
        component={GameSelection}
        />

        <Stack.Screen 
          name="rulesTower" 
          component={RulesTower} 
        />

        <Stack.Screen 
          name="rulesCharades" 
          component={RulesCharades} 
        />

        <Stack.Screen 
          name="rulesWhoAmI" 
          component={RulesWhoAmI} 
        />

        <Stack.Screen 
          name="rulesTaboo" 
          component={RulesTaboo} 
        />

        <Stack.Screen 
          name="tower" 
          component={Tower} 
        />

        <Stack.Screen 
          name="whoAmI" 
          component={WhoAmI} 
        />

        <Stack.Screen 
          name="charades" 
          component={Charades} 
        />

        <Stack.Screen 
          name="taboo" 
          component={Taboo} 
        />
        <Stack.Screen 
          name="settings" 
          component={SettingsScreen}
        />

      </Stack.Navigator>
        </NavigationContainer>
      </SettingsProvider>
    );
}

