import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import LogoutScreen from '../screens/LogoutScreen';
import PhoneSignIn from '../screens/PhoneSignIn';
import ProfileScreen from '../screens/ProfileScreen';

import NavigationService from './NavigationService';
import auth from '@react-native-firebase/auth';

const Stack = createStackNavigator();

const AppNavigator = () => {
  // Animation For Swipe Right To Left
  const RightToLeftAnimation = {
    headerShown: false,
    headerTitleAlign: 'center',
    cardStyleInterpolator: ({current, layouts}) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  };

  // Animation For Swipe Left To Right
  const LeftToRightAnimation = {
    headerTitleAlign: 'center',
    cardStyleInterpolator: ({current, layouts}) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  };

  const [user, setUser] = useState();
  // console.log('AppNavigator :', user);

  const onAuthStateSave = user => setUser(user);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateSave);
    return subscriber;
  }, []);

  return (
    <NavigationContainer
      ref={ref => NavigationService.setTopLevelNavigator(ref)}>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={RightToLeftAnimation}
            />
            <Stack.Screen
              name="Logout"
              component={LogoutScreen}
              options={RightToLeftAnimation}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={LeftToRightAnimation}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={LeftToRightAnimation}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={LeftToRightAnimation}
            />
            <Stack.Screen
              name="PhoneSignIn"
              component={PhoneSignIn}
              options={LeftToRightAnimation}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
