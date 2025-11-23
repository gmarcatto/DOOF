import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import RestaurantListScreen from './src/screens/RestaurantListScreen';
import RestaurantFormScreen from './src/screens/RestaurantFormScreen';
import RestaurantDetailScreen from './src/screens/RestaurantDetailScreen';

export type RootStackParamList = {
  RestaurantList: undefined;
  RestaurantForm: { restaurantId?: string };
  RestaurantDetail: { restaurantId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator 
        initialRouteName="RestaurantList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="RestaurantList" 
          component={RestaurantListScreen}
          options={{ title: 'Restaurantes' }}
        />
        <Stack.Screen 
          name="RestaurantForm" 
          component={RestaurantFormScreen}
          options={{ title: 'Restaurante' }}
        />
        <Stack.Screen 
          name="RestaurantDetail" 
          component={RestaurantDetailScreen}
          options={{ title: 'Detalhes' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
