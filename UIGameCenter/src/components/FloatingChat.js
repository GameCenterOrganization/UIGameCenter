import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChatService from '../services/ChatService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FloatingChat = ({ visible = true, fullScreen = false }) => {
  // UI / data state
  const [mounted, setMounted] = useState(false); 
  const [isOpen, setIsOpen] = useState(false);   
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const flatListRef = useRef(null);

  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  
  const toggleChat = () => {
    if (!mounted) {
      
      setMounted(true);
      setIsOpen(true);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsOpen(false);
        setMounted(false);
      });
    }
  };

 
  useEffect(() => {
    if (!visible) return;
    if (mounted) {
      checkConnection();
    }
    
  }, [mounted, visible]);

  
  const checkConnection = async () => {
    try {
      const health = await ChatService.checkHealth();
      const ok = health && health.status === 'OK';
      setConnected(ok);
      
      if (ok && messages.length === 0) {
        addMessage('¡Hola! Soy tu asistente gamer. ¿En qué puedo ayudarte?', 'bot');
      }
    } catch (err) {
      setConnected(false);
    }
  };

  const addMessage = (text, sender) => {
    const newMessage = { id: Date.now().toString(), text, sender, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;
    const userMessage = inputText.trim();
    setInputText('');
    setLoading(true);
    addMessage(userMessage, 'user');

    try {
      const response = await ChatService.sendMessage(userMessage);
      
      const botText = response?.response ?? response?.reply ?? 'Lo siento, no obtuve respuesta.';
      addMessage(botText, 'bot');
    } catch (error) {
      addMessage('Lo siento, hubo un error. Intenta de nuevo.', 'bot');
    }

    setLoading(false);
  };

  
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      
      setTimeout(() => {
        try {
          flatListRef.current.scrollToEnd({ animated: true });
        } catch (e) {
          
        }
      }, 40);
    }
  }, [messages]);

  if (!visible) return null;

 
  const chatWidth = fullScreen
    ? SCREEN_WIDTH * 0.95
    : Platform.OS === 'web'
    ? Math.min(480, SCREEN_WIDTH * 0.35) 
    : SCREEN_WIDTH * 0.9;

  const chatHeight = fullScreen
    ? SCREEN_HEIGHT * 0.85
    : Platform.OS === 'web'
    ? SCREEN_HEIGHT * 0.75
    : SCREEN_HEIGHT * 0.6;

  return (
    <>
      {/* FAB - Solo visible cuando el chat NO está abierto */}
      {!mounted && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={toggleChat}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Contenedor animado: solo renderiza si mounted === true */}
      {mounted && (
        <Animated.View
          style={[
            styles.chatContainer,
            {
              width: chatWidth,
              height: chatHeight,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <KeyboardAvoidingView
            style={styles.innerContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.chatHeader}>
              <Text style={styles.headerText}>Gaming Assistant</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* indicador de conexión */}
                <View style={[styles.statusDot, connected ? styles.statusOk : styles.statusErr]} />
                <TouchableOpacity onPress={toggleChat} style={{ marginLeft: 10 }}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => (
                <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
                  <Text style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.botText]}>
                    {item.text}
                  </Text>
                </View>
              )}
              keyExtractor={item => item.id}
              style={styles.messagesList}
              contentContainerStyle={{ paddingVertical: 8 }}
              keyboardShouldPersistTaps="handled"
            />

            <View style={[styles.inputContainer, Platform.OS === 'web' ? styles.inputBorderTop : null]}>
              <TextInput
                style={styles.textInput}
                placeholder={connected ? "Pregunta sobre videojuegos..." : "Conectando..."}
                placeholderTextColor="#9aa0a6"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
                editable={!loading && connected}
              />
              <TouchableOpacity
                style={[styles.sendButton, { opacity: (!inputText.trim() || loading || !connected) ? 0.5 : 1 }]}
                onPress={sendMessage}
                disabled={!inputText.trim() || loading || !connected}
              >
                <Ionicons name={loading ? "reload" : "send"} size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 26,
    right: 18,
    backgroundColor: '#7b2ff7',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1200,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 8,
  },
  chatContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 60 : 30,
    right: Platform.OS === 'web' ? 28 : 20,
    zIndex: 1200,
    backgroundColor: '#111427',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 12,
    
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  innerContainer: { 
    flex: 1 
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#7b2ff7',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 16 
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginRight: 8,
  },
  statusOk: { 
    backgroundColor: '#4ade80' 
  },
  statusErr: { 
    backgroundColor: '#ef4444' 
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  messageContainer: {
    marginVertical: 6,
    padding: 10,
    borderRadius: 14,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#532cbb',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  botMessage: {
    backgroundColor: '#1f2235',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  messageText: { 
    fontSize: 15,
    lineHeight: 20,
  },
  userText: { 
    color: '#fff' 
  },
  botText: { 
    color: '#e1e1e1' 
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#1a1d2e',
  },
  inputBorderTop: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 6,
    color: '#fff',
    fontSize: 14,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  sendButton: {
    backgroundColor: '#7b2ff7',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
  },
});

export default FloatingChat;