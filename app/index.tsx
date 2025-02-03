import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function Welcome() {
  return (
    <View style={styles.container}>
      <Text variant="headlineLarge">Welcome to Flow</Text>
      <View style={styles.buttonContainer}>
        <Link href="/(auth)/login" asChild>
          <Button mode="contained">Login</Button>
        </Link>
        <Link href="/(auth)/signup" asChild>
          <Button mode="outlined" style={styles.signupButton}>
            Sign Up
          </Button>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  buttonContainer: {
    marginTop: 24,
    width: '100%',
    maxWidth: 300,
  },
  signupButton: {
    marginTop: 12,
  },
}); 