import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { analyzeTaskInput } from '../../services/ai';
import { supabase } from '../../services/supabase';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

export default function AITaskChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const analysis = await analyzeTaskInput(input);

      if (analysis.task) {
        const { error } = await supabase.from('tasks').insert([
          {
            ...analysis.task,
            user_id: user.id,
            status: 'pending',
          },
        ]);

        if (error) throw error;
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: analysis.message,
        isUser: false,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error processing your request.',
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.messageList}>
        {messages.map(message => (
          <Surface 
            key={message.id} 
            style={[
              styles.messageBubble,
              message.isUser ? styles.userMessage : styles.aiMessage,
            ]}
          >
            <Text>{message.text}</Text>
          </Surface>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          mode="outlined"
          placeholder="Describe your task..."
          style={styles.input}
          multiline
          disabled={loading}
        />
        <Button
          mode="contained"
          onPress={handleSend}
          loading={loading}
          disabled={loading || !input.trim()}
          style={styles.sendButton}
        >
          Send
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    padding: 12,
    marginBottom: 8,
    maxWidth: '80%',
    borderRadius: 16,
    elevation: 1,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#E3F2FD',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  input: {
    flex: 1,
  },
  sendButton: {
    justifyContent: 'center',
  },
}); 