import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import GoogleLogin from './GoogleLogin';
import PhoneSignIn from './PhoneSignIn';
import {useNavigation} from '@react-navigation/native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const navigation = useNavigation();

  const isValidEmail = email => {
    // Simple email validation regex (you can customize this if needed)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const onLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true); // Show loading indicator while logging in

    auth()
      .signInWithEmailAndPassword(email, password)
      .then(response => {
        setLoading(false); // Hide loading indicator
        Alert.alert('Login successfully!');
        // console.log('response :', response);
      })
      .catch(error => {
        setLoading(false); // Hide loading indicator

        if (error.code === 'auth/wrong-password') {
          Alert.alert('Password is not correct!');
        } else if (error.code === 'auth/user-not-found') {
          Alert.alert('User not found. Please check your email or sign up.');
        } else {
          Alert.alert('An error occurred. Please try again later.');
        }
        console.log('error :', error);
      });
  };

  const onForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const onSignUp = () => {
    navigation.navigate('SignUp');
  };

  const onPhoneSignIn = () => {
    // Navigate to the PhoneSignIn screen
    navigation.navigate('PhoneSignIn');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.signup}>Login Screen</Text>
      <TextInput
        placeholder="Email"
        style={styles.inputBox}
        value={email}
        onChangeText={value => setEmail(value)}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        style={styles.inputBox}
        value={password}
        onChangeText={value => setPassword(value)}
        secureTextEntry={true} // Make the password field secure
        autoCapitalize="none"
      />
      <TouchableOpacity
        onPress={onLogin}
        style={[styles.register, {opacity: loading ? 0.6 : 1}]} // Disable button during loading
        disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.registerTitle}>Login</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={onForgotPassword}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onSignUp}>
        <Text style={styles.signUpLink}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPhoneSignIn}>
        <Text style={styles.signUpLink}>Phone Sign In</Text>
      </TouchableOpacity>

      <GoogleLogin />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: 'grey',
    paddingHorizontal: 12,
    borderRadius: 5,
    width: '90%',
    marginTop: 20,
  },
  register: {
    width: '90%',
    backgroundColor: '#FCAF03',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 40,
  },
  registerTitle: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  signup: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 80,
  },
  forgotPassword: {
    color: '#AD40AF',
    fontWeight: '700',
    marginTop: 10,
  },
  signUpLink: {
    color: '#AD40AF',
    fontWeight: '700',
    marginTop: 10,
  },
});

export default LoginScreen;
