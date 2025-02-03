import { View, StyleSheet } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../src/services/supabase';

type Task = {
  id: string;
  title: string;
  status: string;
};

export default function FocusMode() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, status')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      setTask(data);
    } catch (error) {
      console.error('Error fetching task:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          const newTime = time - 1;
          setProgress(newTime / (25 * 60));
          return newTime;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(25 * 60);
    setProgress(1);
  };

  return (
    <View style={styles.container}>
      {task && (
        <Text variant="headlineSmall" style={styles.taskTitle}>
          {task.title}
        </Text>
      )}

      <Text variant="displayLarge" style={styles.timer}>
        {formatTime(timeRemaining)}
      </Text>
      
      <ProgressBar progress={progress} style={styles.progress} />

      <View style={styles.controls}>
        <Button 
          mode="contained" 
          onPress={toggleTimer}
          style={styles.button}
        >
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button 
          mode="outlined" 
          onPress={resetTimer}
          style={styles.button}
        >
          Reset
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  timer: {
    marginBottom: 32,
  },
  progress: {
    width: '80%',
    height: 8,
    marginBottom: 32,
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    minWidth: 100,
  },
  taskTitle: {
    marginBottom: 48,
    textAlign: 'center',
  },
}); 