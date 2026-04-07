import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/login';
import RegisterScreen from './screens/register';

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

      </Stack.Navigator>
    </NavigationContainer>
  );
}

