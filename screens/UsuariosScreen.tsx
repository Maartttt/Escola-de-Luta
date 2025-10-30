import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Button, Alert } from 'react-native';
import { supabase } from '../services/supabase';
import { useNavigation } from '@react-navigation/native';

export default function UsuariosScreen() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  const fetchUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error(error);
      setUsuarios([]);
    } else {
      setUsuarios(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();

    // 🔥 Escuta em tempo real qualquer mudança na tabela "usuarios"
    const channel = supabase
      .channel('usuarios-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'usuarios' },
        (payload) => {
          console.log('Mudança detectada em usuários:', payload);
          fetchUsuarios(); // atualiza lista automaticamente
        }
      )
      .subscribe();

    // 🧹 Remove o listener ao sair da tela
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteUsuario = async (id: string) => {
    Alert.alert(
      'Confirmação',
      'Deseja realmente excluir este usuário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('usuarios').delete().eq('id', id);
              if (error) throw error;
              setUsuarios(prev => prev.filter(u => u.id !== id));
              Alert.alert('Sucesso', 'Usuário excluído com sucesso!');
            } catch (err: any) {
              Alert.alert('Erro', err.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usuários</Text>

      <Button
        title="Cadastrar Usuário"
        onPress={() => navigation.navigate('Register')}
        color="#1976d2"
      />

      {usuarios.length === 0 ? (
        <Text style={{ marginTop: 20 }}>Nenhum usuário encontrado.</Text>
      ) : (
        <FlatList
          style={{ marginTop: 10 }}
          data={usuarios}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text>Email: {item.email}</Text>
              <Text>Função: {item.role}</Text>

              <View style={styles.buttonsRow}>
                <Button
                  title="Editar"
                  onPress={() => navigation.navigate('UsuarioEdit', { usuario: item })}
                />
                <Button
                  title="Excluir"
                  color="red"
                  onPress={() => handleDeleteUsuario(item.id)}
                />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f7', // fundo pastel suave
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  card: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff', // card branco
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  nome: { fontSize: 18, fontWeight: 'bold' },
  buttonsRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' },
});
