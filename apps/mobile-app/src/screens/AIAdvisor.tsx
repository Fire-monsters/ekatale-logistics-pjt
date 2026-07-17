/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GS, Colors, Font, Space } from '@styles/global';

type ChatMsg = { id: string; role: 'user' | 'ai'; text: string };

const QUICK = ['Best time to plant maize?', 'Current maize price?', 'How to treat leaf spots?'];

export function AIAdvisor() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: '0', role: 'ai', text: 'Hello! How can I help with your farm today?' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    setMessages((current) => [...current, { id: String(Date.now()), role: 'user', text }]);
    setInput('');
    setBusy(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    setMessages((current) => [
      ...current,
      {
        id: String(Date.now() + 1),
        role: 'ai',
        text: text.toLowerCase().includes('price')
          ? 'Current E-Katale maize price: UGX 1,500/kg, up 5.3% this week.'
          : 'Good question. Check soil moisture and protect harvested crops before heavy rain.',
      },
    ]);
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Text style={GS.headerTitleInverse}>AI Farm Advisor</Text>
        <Text style={styles.onlineText}>Online</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickBar} contentContainerStyle={{ gap: 8, padding: 10 }}>
        {QUICK.map((item) => (
          <TouchableOpacity key={item} style={styles.quickBtn} onPress={() => send(item)}>
            <Text style={styles.quickText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 10, padding: Space.md, paddingBottom: 20 }}>
        {messages.map((message) => (
          <View key={message.id} style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.bubbleText, message.role === 'user' && styles.userText]}>{message.text}</Text>
          </View>
        ))}
        {busy && <Text style={styles.typing}>...</Text>}
      </ScrollView>

      <View style={GS.bottomBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your crops..."
          placeholderTextColor={Colors.textDisabled}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => send(input)} disabled={!input.trim() || busy}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export default AIAdvisor;

export {};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#6A1B9A',
    padding: Space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  onlineText: { fontSize: Font.size.caption, color: 'rgba(255,255,255,0.8)' },
  quickBar: { backgroundColor: Colors.surface, borderBottomWidth: 0.5, borderBottomColor: Colors.border, maxHeight: 50 },
  quickBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1.5, borderColor: '#CE93D8' },
  quickText: { fontSize: Font.size.caption, color: '#6A1B9A', fontWeight: Font.weight.medium },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 12 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.border },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.green },
  bubbleText: { fontSize: Font.size.body, color: Colors.textPrimary, lineHeight: 22 },
  userText: { color: Colors.textInverse },
  typing: { marginHorizontal: Space.md, color: Colors.textMuted },
  input: {
    flex: 1,
    fontSize: Font.size.body,
    color: Colors.textPrimary,
    borderWidth: 2,
    borderColor: '#CE93D8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendBtn: { minHeight: 44, paddingHorizontal: 14, borderRadius: 22, backgroundColor: '#6A1B9A', alignItems: 'center', justifyContent: 'center' },
  sendText: { color: Colors.textInverse, fontWeight: Font.weight.bold },
});
