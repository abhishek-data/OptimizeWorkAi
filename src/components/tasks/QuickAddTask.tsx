import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Modal, TextInput, Button, Text, IconButton } from 'react-native-paper';
import { supabase } from '../../services/supabase';

type QuickAddTaskProps = {
  visible: boolean;
  onDismiss: () => void;
  onTaskAdded: () => void;
};

const PriorityColors = {
  1: '#4A90E2', // Blue for low priority
  2: '#F5A623', // Orange for medium priority
  3: '#D0021B', // Red for high priority
};

export default function QuickAddTask({ visible, onDismiss, onTaskAdded }: QuickAddTaskProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priority, setPriority] = useState(1);

  const handleAddTask = async () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('tasks').insert([
        {
          title: title.trim(),
          priority: priority,
          status: 'pending',
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      setTitle('');
      onTaskAdded();
      onDismiss();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Text variant="titleLarge" style={styles.title}>Add Task</Text>
        
        <TextInput
          label="Task name"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          placeholder="What needs to be done?"
          right={<TextInput.Icon icon="calendar" />}
        />
        
        <View style={styles.priorityContainer}>
          <Text variant="bodyMedium">Priority:</Text>
          <View style={styles.priorityButtons}>
            {[1, 2, 3].map((level) => (
              <IconButton
                key={level}
                icon="flag"
                mode="outlined"
                selected={priority === level}
                iconColor={PriorityColors[level]}
                onPress={() => setPriority(level)}
              />
            ))}
          </View>
        </View>

        {error ? (
          <Text style={styles.error} variant="bodySmall">{error}</Text>
        ) : null}

        <View style={styles.buttons}>
          <Button 
            mode="outlined" 
            onPress={onDismiss}
            style={styles.button}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={handleAddTask}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Add Task
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  title: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    minWidth: 100,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priorityButtons: {
    flexDirection: 'row',
    marginLeft: 16,
  },
}); 