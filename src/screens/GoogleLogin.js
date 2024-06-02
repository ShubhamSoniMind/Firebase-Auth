import {View, Button, StyleSheet, Alert} from 'react-native';
import React from 'react';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {WEBCLIENTID} from '../utils/constant';
import auth from '@react-native-firebase/auth';

const GoogleLogin = () => {
  GoogleSignin.configure({
    webClientId: WEBCLIENTID,
  });

  const onGoogleSignin = async () => {
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      const {idToken} = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
    } catch (error) {
      Alert.alert('Error', 'Google Sign-In failed. Please try again.');
      console.error('Google Sign-In Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Google Sign in" onPress={onGoogleSignin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
});

export default GoogleLogin;
