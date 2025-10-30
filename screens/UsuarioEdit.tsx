import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../services/supabase';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function UsuarioEditScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { usuario } = route.params;

  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [role, setRole] = useState(usuario.role);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!nome || !email || !role) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ nome, email, role })
        .eq('id', usuario.id);

      if (error) throw error;

      Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
      navigation.goBack(); // volta para a lista de usuários
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Usuário</Text>

      <Text>Nome</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome do usuário"
      />

      <Text>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email do usuário"
        keyboardType="email-address"
      />

      <Text>Função</Text>
      <TextInput
        style={styles.input}
        value={role}
        onChangeText={setRole}
        placeholder="Função (master/professor)"
      />

      <Button title={loading ? 'Atualizando...' : 'Salvar Alterações'} onPress={handleUpdate} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 15 },
});
