import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CreateNewUser from '../../components/CreateNewUser';


// Create bottom tab navigation
const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Register" component={CreateNewUser} />
        
      </Tab.Navigator>
    </NavigationContainer>
  );
}
