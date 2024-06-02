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
import CountryPicker from 'react-native-country-picker-modal';

const PhoneSignIn = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSendVerificationCode = async () => {
    try {
      setLoading(true); // Start showing the loading indicator
      const fullPhoneNumber = selectedCountry
        ? `+${selectedCountry.callingCode[0]}${phoneNumber}`
        : phoneNumber;

      const confirmation = await auth().signInWithPhoneNumber(fullPhoneNumber);
      setConfirmation(confirmation);
      setLoading(false); // Stop showing the loading indicator
      Alert.alert('Verification code sent!');
    } catch (error) {
      setLoading(false); // Stop showing the loading indicator on error
      console.error('Error sending verification code:', error);
      Alert.alert('Failed to send verification code. Please try again.');
    }
  };

  const onSignInWithVerificationCode = async () => {
    try {
      await confirmation.confirm(verificationCode);
      Alert.alert('Phone number sign-in successful!');
      // You can navigate to the next screen or perform other actions here.
    } catch (error) {
      console.error('Error signing in with verification code:', error);
      Alert.alert(
        'Failed to sign in with verification code. Please try again.',
      );
    }
  };

  const onSelectCountry = country => {
    setSelectedCountry(country);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phone Number Sign In</Text>
      <View style={styles.phoneInputContainer}>
        <View style={styles.countryPickerContainer}>
          <CountryPicker
            withFilter
            withFlag
            withCountryNameButton
            withCallingCodeButton
            withAlphaFilter
            withEmoji
            onSelect={onSelectCountry}
            countryCode={selectedCountry?.cca2}
            translation="eng"
          />
        </View>
        <TextInput
          placeholder="Phone Number"
          style={styles.phoneInput}
          value={phoneNumber}
          onChangeText={value => setPhoneNumber(value)}
          keyboardType="phone-pad"
        />
      </View>
      {confirmation && (
        <TextInput
          placeholder="Verification Code"
          style={styles.inputBox}
          value={verificationCode}
          onChangeText={value => setVerificationCode(value)}
          keyboardType="number-pad"
        />
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#FCAF03" />
      ) : !confirmation ? (
        <TouchableOpacity
          onPress={onSendVerificationCode}
          style={styles.sendCodeButton}>
          <Text style={styles.buttonText}>Send Verification Code</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onSignInWithVerificationCode}
          style={styles.verifyButton}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'grey',
    paddingHorizontal: 12,
    borderRadius: 5,
    width: '90%',
    marginTop: 20,
    alignItems: 'center',
  },
  countryPickerContainer: {
    paddingRight: 10,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: 8,
    fontSize: 16,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: 'grey',
    paddingHorizontal: 12,
    borderRadius: 5,
    width: '90%',
    marginTop: 20,
  },
  sendCodeButton: {
    backgroundColor: '#FCAF03',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 40,
  },
  verifyButton: {
    backgroundColor: '#FCAF03',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

export default PhoneSignIn;
