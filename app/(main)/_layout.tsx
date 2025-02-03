import { Stack } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { Button } from 'react-native-paper';
import { supabase } from '../../src/services/supabase';

export default function MainLayout() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    }
  }, [session, loading]);

  if (loading || !session) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Dashboard',
          headerRight: () => (
            <Button onPress={() => supabase.auth.signOut()}>
              Logout
            </Button>
          ),
        }} 
      />
      <Stack.Screen name="focus-mode" options={{ title: 'Focus Mode' }} />
      <Stack.Screen name="ai-chat" options={{ title: 'AI Assistant' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
} 