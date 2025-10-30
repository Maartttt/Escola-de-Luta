import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { supabase } from '../services/supabase';
import Logo from '../components/Logo';

interface LoginScreenProps {
  setUser: (user: any) => void;
}

export default function LoginScreen({ setUser }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    Keyboard.dismiss(); // Fecha o teclado ao clicar no botão
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) throw error;
      setUser(data.user);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: '#f9f9f9' }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Logo />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
          />
          <Button
            title={loading ? 'Carregando...' : 'Entrar'}
            onPress={handleLogin}
            disabled={loading}
            color="#4CAF50"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    marginBottom: 75,
    backgroundColor: '#f9f9f9'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff'
  }
});