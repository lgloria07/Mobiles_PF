import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//Import de todas las pantallas
import LoginScreen from './screens/login';
import RegisterScreen from './screens/register';
import PartyScreen from './screens/party';
import GameSelection from './screens/gameSelection'
import RulesTower from './screens/rulesTower';
import RulesCharades from './screens/rulesCharades';
import RulesWhoAmI from './screens/rulesWhoAmI';
import RulesTaboo from './screens/rulesTaboo';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
      initialRouteName="login"
      screenOptions={{ headerShown: false }}>

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

      </Stack.Navigator>
    </NavigationContainer>
  );
}

