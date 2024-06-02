import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {Picker} from '@react-native-picker/picker';
import ImagePicker from 'react-native-image-crop-picker';
import CountryPicker from 'react-native-country-picker-modal';
import storage from '@react-native-firebase/storage'; // Import Firebase Storage

const SignUpScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male'); // Default value is 'male'
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState(null);
  const [mobile, setMobile] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);

  // State variables for validation status
  const [nameError, setNameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [ageError, setAgeError] = useState(null);
  const [addressError, setAddressError] = useState(null);
  const [mobileError, setMobileError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Function to check if the email is in a valid format
  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function to handle the registration process
  const onRegister = () => {
    // Validate all input fields
    validateName();
    validateEmail();
    validatePassword();
    validateAge();
    validateAddress();
    validateMobile();

    // Check if any validation errors exist
    if (
      nameError ||
      emailError ||
      passwordError ||
      ageError ||
      addressError ||
      mobileError
    ) {
      Alert.alert('Error', 'Please fix the errors in the form.');
      return;
    }

    setLoading(true);

    // Register the user with Firebase Authentication
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;

        // If a photo is selected, upload it to Firebase Storage
        if (photo) {
          uploadProfileImage(user);
        } else {
          // If no photo is selected, proceed with user creation without uploading an image
          updateAdditionalUserData(user, null);
        }
      })
      .catch(error => {
        setLoading(false);
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('Error', 'That email address is already in use!');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Error', 'That email address is invalid!');
        } else {
          console.error('Error creating user:', error);
          Alert.alert(
            'Error',
            'Failed to create user account. Please try again.',
          );
        }
      });
  };

  // Function to upload the profile image to Firebase Storage
  const uploadProfileImage = user => {
    setUploading(true);
    const reference = storage().ref(`profile_images/${email}`);
    const task = reference.putFile(photo);

    // Set up a listener for the upload progress
    task.on('state_changed', taskSnapshot => {
      const progress = Math.round(
        (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100,
      );
      console.log(`Upload is ${progress}% complete`);
      // You can set the progress to a state variable if you want to show a progress bar
    });

    // Handle the completion of the upload
    task
      .then(() => {
        console.log('Image uploaded to Firebase Storage');
        reference
          .getDownloadURL()
          .then(url => {
            console.log('Image URL:', url);
            // Once you have the download URL, you can save it to the user's profile
            updateAdditionalUserData(user, url);
          })
          .catch(error => {
            setUploading(false);
            console.error('Error getting download URL:', error);
            Alert.alert(
              'Error',
              'Failed to get image download URL. Please try again.',
            );
          });
      })
      .catch(error => {
        setUploading(false);
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      });
  };

  // Function to update additional user data to the Firebase Realtime Database
  const updateAdditionalUserData = (user, imageUrl) => {
    return user
      .updateProfile({
        displayName: name,
        photoURL: imageUrl, // Set the user's photo URL
      })
      .then(() => {
        // Save additional user data to the Firebase Realtime Database
        return database()
          .ref(`users/${user.uid}`)
          .set({
            name: name,
            age: age,
            gender: gender,
            address: address,
            mobile: {
              country: selectedCountry?.cca2,
              number: mobile,
            },
          });
      })
      .then(() => {
        setLoading(false);
        Alert.alert('Success', 'User account created successfully!');
      })
      .catch(error => {
        setLoading(false);
        console.error('Error updating user profile:', error);
        Alert.alert(
          'Error',
          'Failed to update user profile. Please try again.',
        );
      });
  };

  // Functions to validate individual input fields
  const validateName = () => {
    if (!name) {
      setNameError('Please enter your name.');
    } else {
      setNameError(null);
    }
  };

  const validateEmail = () => {
    if (!email) {
      setEmailError('Please enter your email address.');
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError(null);
    }
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError('Please enter a password.');
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
    } else {
      setPasswordError(null);
    }
  };

  const validateAge = () => {
    if (!age) {
      setAgeError('Please enter your age.');
    } else if (isNaN(Number(age)) || Number(age) > 99) {
      setAgeError('Please enter a valid age (0-99).');
    } else {
      setAgeError(null);
    }
  };

  const validateAddress = () => {
    if (!address) {
      setAddressError('Please enter your address.');
    } else {
      setAddressError(null);
    }
  };

  const validateMobile = () => {
    if (!mobile) {
      setMobileError('Please enter your mobile number.');
    } else if (isNaN(Number(mobile))) {
      setMobileError('Please enter a valid mobile number.');
    } else {
      setMobileError(null);
    }
  };

  const handleImageSelection = async () => {
    try {
      const cameraPermission = PermissionsAndroid.PERMISSIONS.CAMERA;
      const storagePermission =
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

      const cameraPermissionGranted = await PermissionsAndroid.check(
        cameraPermission,
      );
      const storagePermissionGranted = await PermissionsAndroid.check(
        storagePermission,
      );

      if (!cameraPermissionGranted || !storagePermissionGranted) {
        const granted = await PermissionsAndroid.requestMultiple([
          cameraPermission,
          storagePermission,
        ]);

        if (
          granted[cameraPermission] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[storagePermission] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          // Both permissions are granted, proceed with image selection
          ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true,
          })
            .then(image => {
              console.log(image);
              setPhoto(image.path);
            })
            .catch(error => {
              console.log('ImagePicker Error:', error);
            });
        } else {
          // Handle the case when permissions are not granted
          console.log('Camera and storage permissions are required.');
        }
      } else {
        // Permissions are already granted, proceed with image selection
        ImagePicker.openPicker({
          width: 300,
          height: 400,
          cropping: true,
        })
          .then(image => {
            console.log(image);
            setPhoto(image.path);
          })
          .catch(error => {
            console.log('ImagePicker Error:', error);
          });
      }
    } catch (error) {
      console.log('Error occurred while requesting permissions:', error);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handleImageSelection}
          style={styles.imagePicker}>
          {photo ? (
            <Image source={{uri: photo}} style={styles.imagePreview} />
          ) : (
            <Text style={styles.imagePickerText}>Select an Image</Text>
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Full Name"
          style={styles.inputBox}
          value={name}
          onChangeText={value => setName(value)}
          onBlur={validateName}
        />
        {nameError && <Text style={styles.errorText}>{nameError}</Text>}
        <TextInput
          placeholder="Email"
          style={styles.inputBox}
          value={email}
          onChangeText={value => setEmail(value)}
          onBlur={validateEmail}
        />
        {emailError && <Text style={styles.errorText}>{emailError}</Text>}
        <TextInput
          placeholder="Password"
          style={styles.inputBox}
          value={password}
          onChangeText={value => setPassword(value)}
          secureTextEntry={true}
          onBlur={validatePassword}
        />
        {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
        <TextInput
          placeholder="Age (0-99)"
          style={styles.inputBox}
          value={age}
          maxLength={2}
          onChangeText={value => setAge(value)}
          keyboardType="numeric"
          onBlur={validateAge}
        />
        {ageError && <Text style={styles.errorText}>{ageError}</Text>}
        <View style={styles.phoneInputContainer}>
          <View style={styles.countryPickerContainer}>
            <CountryPicker
              withFilter
              withFlag
              withCountryNameButton
              withCallingCodeButton
              withAlphaFilter
              withEmoji
              onSelect={country => setSelectedCountry(country)}
              countryCode={selectedCountry?.cca2}
              translation="eng"
            />
          </View>
          <TextInput
            placeholder="Mobile Number"
            style={styles.phoneInput}
            value={mobile}
            onChangeText={value => setMobile(value)}
            keyboardType="phone-pad"
            onBlur={validateMobile}
          />
        </View>
        {mobileError && <Text style={styles.errorText}>{mobileError}</Text>}
        <View style={styles.inputBox}>
          <Picker
            selectedValue={gender}
            onValueChange={value => setGender(value)}>
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
        <TextInput
          placeholder="Address"
          style={[styles.inputBox, {height: 100}]}
          value={address}
          onChangeText={value => setAddress(value)}
          multiline
          onBlur={validateAddress}
        />
        {addressError && <Text style={styles.errorText}>{addressError}</Text>}

        <TouchableOpacity onPress={onRegister} style={styles.register}>
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.registerTitle}>Register</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  errorText: {
    color: 'red',
    marginTop: 5,
  },
  imagePicker: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'grey',
    width: 100, // Adjust the size to your preference
    height: 100, // Adjust the size to your preference
    borderRadius: 100, // To create a circle shape
    overflow: 'hidden',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#000000',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default SignUpScreen;
