import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../services/supabase';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AlunoEditScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { aluno } = route.params;

  const [nome, setNome] = useState(aluno.nome);
  const [email, setEmail] = useState(aluno.email);
  const [telefone, setTelefone] = useState(aluno.telefone);
  const [foto, setFoto] = useState(aluno.foto);
  const [modalidade, setModalidade] = useState(aluno.modalidade);
  const [plano, setPlano] = useState(aluno.plano);
  const [dataInicio, setDataInicio] = useState(aluno.data_inicio ? new Date(aluno.data_inicio) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { Alert.alert('Permissão negada'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets[0].base64) {
      setFoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleUpdateAluno = async () => {
    if (!nome || !modalidade || !plano || !dataInicio) {
      return Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
    }

    const sqlDate = `${dataInicio.getFullYear()}-${(dataInicio.getMonth()+1).toString().padStart(2,'0')}-${dataInicio.getDate().toString().padStart(2,'0')}`;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('alunos')
        .update({ nome, email, telefone, foto, modalidade, plano, data_inicio: sqlDate })
        .eq('id', aluno.id);
      if (error) throw error;
      Alert.alert('Sucesso', 'Aluno atualizado com sucesso!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
      style={{ flex: 1 }}
      enabled
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={styles.title}>Editar Aluno</Text>

        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity onPress={pickImage} style={styles.photoButton}>
            <Text style={styles.photoButtonText}>Alterar Foto</Text>
          </TouchableOpacity>
          {foto && <Image source={{ uri: foto }} style={styles.image} />}
        </View>

        <Text style={styles.label}>Nome *</Text>
        <TextInput value={nome} onChangeText={setNome} style={styles.input} placeholder="Digite o nome completo" />

        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="exemplo@email.com" keyboardType="email-address" />

        <Text style={styles.label}>Telefone</Text>
        <TextInput value={telefone} onChangeText={setTelefone} style={styles.input} placeholder="(00) 00000-0000" keyboardType="phone-pad" />

        <Text style={styles.label}>Data de Início *</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
          <Text>{dataInicio.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dataInicio}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDataInicio(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Modalidade *</Text>
        <View style={styles.buttonGroup}>
          {['Boxe','Jiu-jitsu','Muay Thai'].map(m => (
            <TouchableOpacity key={m} style={[styles.optionButton, modalidade===m && styles.selected]} onPress={() => setModalidade(m)}>
              <Text style={[styles.optionText, modalidade===m && styles.selectedText]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Plano *</Text>
        <View style={styles.buttonGroup}>
          {['Mensal','Trimestral','Anual'].map(p => (
            <TouchableOpacity key={p} style={[styles.optionButton, plano===p && styles.selected]} onPress={() => setPlano(p)}>
              <Text style={[styles.optionText, plano===p && styles.selectedText]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateAluno} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Atualizando...' : 'Atualizar Aluno'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 18, borderRadius: 8, backgroundColor: 'white', fontSize: 16 },
  image: { width: 120, height: 120, marginBottom: 15, borderRadius: 10 },
  photoButton: { backgroundColor: '#e0e0e0', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  photoButtonText: { color: '#0066cc', fontWeight: '500', fontSize: 16 },
  buttonGroup: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  optionButton: { borderWidth: 1, borderColor: '#ccc', padding: 10, margin: 5, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  selected: { backgroundColor: '#0066cc', borderColor: '#0066cc' },
  optionText: { fontSize: 16 },
  selectedText: { color: 'white', fontWeight: '500' },
  updateButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
