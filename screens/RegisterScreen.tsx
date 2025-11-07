import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { supabase } from '../services/supabase';
import { useNavigation } from '@react-navigation/native';
import Logo from '../components/Logo';

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

          {/* Nome */}
          <View style={styles.field}>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />
          </View>

          {/* Senha */}
          <View style={styles.field}>
            <Text style={styles.label}>Senha *</Text>
            <TextInput
              value={senha}
              onChangeText={setSenha}
              style={styles.input}
              secureTextEntry
            />
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Telefone */}
          <View style={styles.field}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              value={telefone}
              onChangeText={setTelefone}
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          {/* Role */}
          <View style={styles.field}>
            <Text style={styles.label}>Role *</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  userRole === 'master' && styles.selectedRole,
                ]}
                onPress={() => setUserRole('master')}
              >
                <Text
                  style={
                    userRole === 'master'
                      ? styles.selectedText
                      : styles.unselectedText
                  }
                >
                  Master
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  userRole === 'professor' && styles.selectedRole,
                ]}
                onPress={() => setUserRole('professor')}
              >
                <Text
                  style={
                    userRole === 'professor'
                      ? styles.selectedText
                      : styles.unselectedText
                  }
                >
                  Professor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botão */}
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Cadastrar Usuário</Text>
          </TouchableOpacity>
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
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  roleButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedRole: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  unselectedText: {
    color: '#000',
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
