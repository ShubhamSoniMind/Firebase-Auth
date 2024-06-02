import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const onResetPassword = () => {
    if (!email) {
      setEmailError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        setSuccessMessage(
          'Password reset email sent. Please check your inbox for further instructions.',
        );
        setEmail('');
        setEmailError(null);
      })
      .catch(error => {
        if (error.code === 'auth/user-not-found') {
          Alert.alert('Error', 'User not Found!');
        } else {
          Alert.alert(
            'Error',
            'Failed to send password reset email. Please try again.',
          );
        }
        // console.error('Error sending password reset email:', error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.description}>
        Enter your email address below to receive a password reset link.
      </Text>
      <TextInput
        placeholder="Email"
        style={styles.inputBox}
        value={email}
        onChangeText={e => setEmail(e)}
      />
      {emailError && <Text style={styles.errorText}>{emailError}</Text>}
      {successMessage && (
        <Text style={styles.successMessage}>{successMessage}</Text>
      )}
      <TouchableOpacity onPress={onResetPassword} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: 'grey',
    paddingHorizontal: 12,
    borderRadius: 5,
    width: '90%',
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#FCAF03',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    width: '60%',
    marginTop: 20,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
  successMessage: {
    color: 'green',
    marginTop: 5,
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
