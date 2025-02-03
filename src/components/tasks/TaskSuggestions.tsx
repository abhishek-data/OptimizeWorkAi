import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, Button, Portal, Modal } from 'react-native-paper';
import { getTaskSuggestions } from '../../services/ai';

type TaskSuggestionsProps = {
  tasks: any[];
};

export default function TaskSuggestions({ tasks }: TaskSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const suggestions = await getTaskSuggestions(tasks);
      setSuggestions(suggestions);
      setVisible(true);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Surface style={styles.container}>
        <Button
          mode="outlined"
          onPress={fetchSuggestions}
          loading={loading}
          disabled={loading || tasks.length === 0}
        >
          Get AI Suggestions
        </Button>
      </Surface>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.title}>AI Suggestions</Text>
          <Text style={styles.suggestions}>{suggestions}</Text>
          <Button mode="contained" onPress={() => setVisible(false)}>
            Close
          </Button>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    elevation: 1,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  title: {
    marginBottom: 16,
  },
  suggestions: {
    marginBottom: 16,
    lineHeight: 20,
  },
}); 