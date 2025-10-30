import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { supabase } from '../services/supabase';
import { useNavigation } from '@react-navigation/native';
import Logo from '../components/Logo'; // 🔹 Logo remota

interface Props {
  user: any;
  role: string | null;
}

export default function RegisterScreen({ user, role }: Props) {
  const navigation = useNavigation<any>();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [userRole, setUserRole] = useState<'master' | 'professor'>('professor');

  useEffect(() => {
    if (role !== 'master') {
      Alert.alert('Acesso negado', 'Somente o Master pode acessar esta tela.');
      navigation.goBack();
    }
  }, [role]);

  const handleRegister = async () => {
    try {
      if (!nome || !email || !senha) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
      });
      if (authError) throw authError;

      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          id: authData.user.id,
          nome,
          email,
          telefone,
          role: userRole,
        });
      if (insertError) throw insertError;

      Alert.alert('Sucesso', 'Usuário cadastrado!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro no cadastro', error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: '#f9f9f9' }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Logo />

          <Text style={styles.title}>Cadastrar Usuário</Text>

          <TextInput placeholder="Nome" value={nome} onChangeText={setNome} style={styles.input} />
          <TextInput placeholder="Senha" value={senha} onChangeText={setSenha} style={styles.input} secureTextEntry />
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
          <TextInput placeholder="Telefone" value={telefone} onChangeText={setTelefone} style={styles.input} keyboardType="phone-pad" />

          <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>Role:</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, userRole === 'master' && styles.selectedRole]}
              onPress={() => setUserRole('master')}
            >
              <Text style={userRole === 'master' ? styles.selectedText : styles.text}>Master</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleButton, userRole === 'professor' && styles.selectedRole]}
              onPress={() => setUserRole('professor')}
            >
              <Text style={userRole === 'professor' ? styles.selectedText : styles.text}>Professor</Text>
            </TouchableOpacity>
          </View>

          <Button title="Cadastrar" onPress={handleRegister} color="#4CAF50" />
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginBottom: 75,
  },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  roleButton: { padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  selectedRole: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  text: { color: '#000', fontWeight: '500' },
  selectedText: { color: '#fff', fontWeight: 'bold' },
});
