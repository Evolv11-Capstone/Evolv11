import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CreateNewUser from '../../components/CreateNewUser';
import PlayerHub from '../../components/PlayerHub';

// Create bottom tab navigation
const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Register" component={CreateNewUser} />
        <Tab.Screen name="PlayerHub" component={PlayerHub} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
