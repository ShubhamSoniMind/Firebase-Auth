import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

const ProfileScreen = () => {
  const [providerId, setProviderId] = useState(null);
  const [user, setUser] = useState(null);
  const [userFullData, setUserFullData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to changes in the authentication state
    const unsubscribe = auth().onAuthStateChanged(currentUser => {
      if (currentUser) {
        // If the user is logged in, fetch their data from the database
        console.log('currentUser :', currentUser);
        currentUser.providerData.forEach(provider => {
          if (provider.providerId === auth.PhoneAuthProvider.PROVIDER_ID) {
            setProviderId('phone');
            console.log('User logged in via phone.');
            setUser(currentUser);
            setUserFullData(currentUser);
            setLoading(false);
          } else if (
            provider.providerId === auth.GoogleAuthProvider.PROVIDER_ID
          ) {
            console.log('User logged in via Google.');
            setProviderId('google');
            setUser(currentUser);
            setUserFullData(currentUser);
            setLoading(false);
          } else if (
            provider.providerId === auth.EmailAuthProvider.PROVIDER_ID
          ) {
            console.log('User logged in via email.');
            setProviderId('email');
            setUserFullData(currentUser);
            fetchUserData(currentUser.uid);
          }
        });
      } else {
        // If the user is not logged in, clear the user data and stop loading
        setUser(null);
        setLoading(false);
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  const fetchUserData = userId => {
    // Fetch the user data from the database using the provided userId
    database()
      .ref(`users/${userId}`)
      .once('value')
      .then(snapshot => {
        const userData = snapshot.val();
        setUser(userData);
        setLoading(false); // Data fetched, set loading to false
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setLoading(false); // Error occurred, set loading to false
      });
  };

  const handleSignOut = async () => {
    try {
      await auth().signOut();
      // Once the user signs out, the onAuthStateChanged event will be triggered,
      // and the user data will be cleared automatically.
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  console.log('user :', user);
  console.log('userFullData :', userFullData);

  const ProfileRender = () => {
    if (providerId === 'phone') {
      return (
        <>
          <View style={styles.profileContainer}>
            <Text style={styles.profileInfo}>Logged In Via: {providerId} </Text>

            <Text style={styles.profileInfo}>Mobile: {user.phoneNumber}</Text>

            <Button title="Sign Out" onPress={handleSignOut} />
          </View>
        </>
      );
    } else if (providerId === 'google') {
      return (
        <>
          <View style={styles.profileContainer}>
            <Text style={styles.profileInfo}>Logged In Via: {providerId} </Text>
            {userFullData.photoURL ? (
              <Image
                source={{
                  uri: userFullData.photoURL,
                }}
                style={styles.profileImage}
              />
            ) : (
              <Text style={styles.noProfileImage}>No Profile Image</Text>
            )}
            <Text style={styles.profileInfo}>
              Name: {userFullData.displayName}
            </Text>
            <Text style={styles.profileInfo}>Email: {userFullData.email}</Text>

            <Button title="Sign Out" onPress={handleSignOut} />
          </View>
        </>
      );
    } else if (providerId === 'email') {
      return (
        <>
          <View style={styles.profileContainer}>
            <Text style={styles.profileInfo}>Logged In Via: {providerId} </Text>
            {userFullData.photoURL ? (
              <Image
                source={{
                  uri: userFullData.photoURL,
                }}
                style={styles.profileImage}
              />
            ) : (
              <Text style={styles.noProfileImage}>No Profile Image</Text>
            )}
            <Text style={styles.profileInfo}>
              Name: {userFullData.displayName}
            </Text>
            <Text style={styles.profileInfo}>Email: {userFullData.email}</Text>
            <Text style={styles.profileInfo}>Age: {user.age}</Text>
            <Text style={styles.profileInfo}>Gender: {user.gender}</Text>
            <Text style={styles.profileInfo}>Address: {user.address}</Text>

            <Text style={styles.profileInfo}>
              Mobile: {user.mobile?.country} {user.mobile?.number}
            </Text>

            <Button title="Sign Out" onPress={handleSignOut} />
          </View>
        </>
      );
    }
  };

  return (
    <View style={styles.container}>
      {loading ? ( // Show loading indicator while data is being fetched
        <ActivityIndicator size="large" color="#000000" />
      ) : user ? (
        <ProfileRender />
      ) : (
        <>
          <Text>You are not logged in.</Text>
          <Button title="Sign Out" onPress={handleSignOut} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  noProfileImage: {
    marginBottom: 10,
    fontSize: 16,
    color: 'gray',
  },
  profileInfo: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
});

export default ProfileScreen;
