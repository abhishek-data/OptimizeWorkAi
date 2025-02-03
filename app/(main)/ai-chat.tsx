import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AITaskChat from '../../src/components/tasks/AITaskChat';

export default function AIChatScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AITaskChat />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 