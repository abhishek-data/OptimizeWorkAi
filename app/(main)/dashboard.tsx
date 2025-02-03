import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB, Card, Button, IconButton, Surface } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../src/services/supabase';
import QuickAddTask from '../../src/components/tasks/QuickAddTask';
import TaskSuggestions from '../../src/components/tasks/TaskSuggestions';

type Task = {
  id: string;
  title: string;
  description?: string;
  priority: number;
  status: string;
  due_date?: string;
  completed_at?: string;
  tags?: string[];
  estimated_time?: number;
};

const PriorityColors = {
  1: '#4A90E2', // Blue for low priority
  2: '#F5A623', // Orange for medium priority
  3: '#D0021B', // Red for high priority
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      await fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <Card 
      style={[
        styles.taskCard,
        item.status === 'completed' && styles.completedTask
      ]}
    >
      <Card.Content>
        <View style={styles.taskHeader}>
          <IconButton
            icon={item.status === 'completed' ? 'check-circle' : 'circle-outline'}
            iconColor={item.status === 'completed' ? '#4CAF50' : '#757575'}
            onPress={() => handleCompleteTask(item.id)}
          />
          <View style={styles.taskContent}>
            <Text 
              variant="titleMedium"
              style={[
                item.status === 'completed' && styles.completedText,
                { color: PriorityColors[item.priority] }
              ]}
            >
              {item.title}
            </Text>
            {item.description && (
              <Text variant="bodyMedium" style={styles.description}>
                {item.description}
              </Text>
            )}
            <View style={styles.taskMeta}>
              {item.due_date && (
                <View style={styles.metaItem}>
                  <IconButton icon="calendar" size={16} />
                  <Text>{new Date(item.due_date).toLocaleDateString()}</Text>
                </View>
              )}
              {item.estimated_time && (
                <View style={styles.metaItem}>
                  <IconButton icon="clock-outline" size={16} />
                  <Text>{item.estimated_time}m</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <Text variant="bodySmall">Priority: {item.priority}</Text>
        {item.due_date && (
          <Text variant="bodySmall">
            Due: {new Date(item.due_date).toLocaleDateString()}
          </Text>
        )}
      </Card.Content>
      <Card.Actions>
        <Link 
          href={{
            pathname: "/focus-mode",
            params: { taskId: item.id }
          }} 
          asChild
        >
          <Button 
            mode="contained-tonal"
            disabled={item.status === 'completed'}
          >
            Start Focus
          </Button>
        </Link>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <TaskSuggestions tasks={tasks} />
      
      {loading ? (
        <Text>Loading tasks...</Text>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="headlineSmall">No tasks yet</Text>
          <Text variant="bodyMedium">Add your first task to get started</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setQuickAddVisible(true)}
      />

      <FAB
        icon="robot"
        style={[styles.fab, styles.aiFab]}
        onPress={() => router.push('/ai-chat')}
      />

      <QuickAddTask
        visible={quickAddVisible}
        onDismiss={() => setQuickAddVisible(false)}
        onTaskAdded={fetchTasks}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  taskCard: {
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedTask: {
    opacity: 0.7,
    backgroundColor: '#f0f0f0',
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  aiFab: {
    bottom: 80,
  },
  taskContent: {
    flex: 1,
    marginLeft: 8,
  },
  description: {
    color: '#666',
    marginTop: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 