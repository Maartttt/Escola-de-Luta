import React, { useState } from 'react';
import {
  View,
  Text,
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
          <Text style={styles.title}>Login</Text>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Senha */}
          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={senha}
              onChangeText={setSenha}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

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
    padding: 20,
    justifyContent: 'center',
    alignItems: 'stretch',
    marginBottom: 75,
  },
  title: {
    fontSize: 22,
    marginBottom: 25,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000',
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#000',
  },
});
