import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Button, Alert, Image, ScrollView, TouchableOpacity } from 'react-native';
import { supabase } from '../services/supabase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Logo from '../components/Logo';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen({ user, role }: any) {
  const navigation = useNavigation<any>();
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlunos = async () => {
    if (!user || !role) return;
    setLoading(true);

    let query = supabase.from('alunos').select('*');
    if (role === 'professor') query = query.eq('professor_id', user.id);

    const { data, error } = await query.order('id', { ascending: false });
    if (error) {
      console.error('Erro ao buscar alunos:', error.message);
      setAlunos([]);
    } else {
      setAlunos(data || []);
    }
    setLoading(false);
  };

  // 🔁 Atualiza automaticamente ao voltar para a tela
  useFocusEffect(
    useCallback(() => {
      fetchAlunos();
    }, [user, role])
  );

  // ⚙️ Adiciona o botão de atualizar no header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={async () => {
            setLoading(true);
            await fetchAlunos();
            Alert.alert('Atualizado', 'Os dados foram recarregados com sucesso!');
          }}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="refresh" size={26} color="#007AFF" />
        </TouchableOpacity>
      ),
      title: 'Dashboard',
    });
  }, [navigation, user, role]);

  const handleDeleteAluno = async (id: string) => {
    Alert.alert(
      'Confirmação',
      'Deseja realmente excluir este aluno?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('alunos').delete().eq('id', id);
              if (error) throw error;
              setAlunos(prev => prev.filter(a => a.id !== id));
              Alert.alert('Sucesso', 'Aluno excluído com sucesso!');
            } catch (err: any) {
              Alert.alert('Erro', err.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '---';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const calcularDataFim = (dataInicio: string, plano: string) => {
    if (!dataInicio || !plano) return null;
    const [year, month, day] = dataInicio.split('-');
    const inicio = new Date(`${year}-${month}-${day}`);
    let fim = new Date(inicio);

    if (plano === 'Mensal') fim.setMonth(fim.getMonth() + 1);
    if (plano === 'Trimestral') fim.setMonth(fim.getMonth() + 3);
    if (plano === 'Anual') fim.setFullYear(fim.getFullYear() + 1);

    return fim;
  };

  const getCardColor = (dataInicio: string, plano: string) => {
    const fim = calcularDataFim(dataInicio, plano);
    if (!fim) return '#fff';
    const hoje = new Date();
    const diffDias = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) return '#ffe6e6'; // vermelho se já passou
    if (diffDias <= 5) return '#fff3b0'; // amarelo nos próximos 5 dias
    return '#fff';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Logo />
      <Text style={styles.title}>Alunos ({role})</Text>

      {role === 'master' && (
        <Button title="Ver Usuários" onPress={() => navigation.navigate('Usuarios')} />
      )}
      <View style={{ marginTop: 5 }}>
        <Button title="Cadastrar Aluno" onPress={() => navigation.navigate('AlunoForm')} />
      </View>

      {alunos.length === 0 ? (
        <Text style={{ marginTop: 20 }}>Nenhum aluno encontrado.</Text>
      ) : (
        <FlatList
          style={{ marginTop: 10, marginBottom: 75 }}
          data={alunos}
          keyExtractor={item => item.id?.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: getCardColor(item.data_inicio, item.plano) }]}>
              {item.foto && <Image source={{ uri: item.foto }} style={styles.image} />}
              <Text style={styles.nome}>{item.nome}</Text>
              <Text>Email: {item.email || '---'}</Text>
              <Text>Telefone: {item.telefone || '---'}</Text>
              <Text>Modalidade: {item.modalidade || '---'}</Text>
              <Text>Plano: {item.plano || '---'}</Text>
              <Text>Início: {formatDate(item.data_inicio)}</Text>

              {role === 'master' && (
                <View style={styles.buttonsRow}>
                  <Button title="Editar" onPress={() => navigation.navigate('AlunoEdit', { aluno: item })} />
                  <Button title="Excluir" color="red" onPress={() => handleDeleteAluno(item.id)} />
                </View>
              )}
            </View>
          )}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 15, textAlign: 'center' },
  card: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  nome: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  image: { width: 60, height: 60, borderRadius: 30, marginBottom: 10 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 10 },
});
