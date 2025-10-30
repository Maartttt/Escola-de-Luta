import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../services/supabase";

export default function AlunoFormScreen({ navigation, user, role }: any) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [modalidade, setModalidade] = useState("");
  const [plano, setPlano] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permissão negada");
      return;
    }

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

  const formatDateToSQL = (date: string) => {
    const [day, month, year] = date.split("-");
    return `${year}-${month}-${day}`;
  };

  const handleRegisterAluno = async () => {
    if (!nome || !modalidade || !plano || !dataInicio) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios!");
      return;
    }

    setLoading(true);
    try {
      let aluno: any = {
        nome,
        email,
        telefone,
        foto,
        modalidade,
        plano,
        data_inicio: formatDateToSQL(dataInicio),
      };
      if (role === "professor") aluno.professor_id = user.id;

      const { error } = await supabase.from("alunos").insert([aluno]);
      if (error) throw error;

      Alert.alert("Sucesso", "Aluno cadastrado com sucesso!");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
      style={{ flex: 1 }}
      enabled
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Nome *</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Digite o nome completo"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="exemplo@email.com"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
        />

        <TouchableOpacity onPress={pickImage} style={styles.photoButton}>
          <Text style={styles.photoButtonText}>Selecionar Foto</Text>
        </TouchableOpacity>
        {foto && <Image source={{ uri: foto }} style={styles.image} />}

        <Text style={styles.label}>Modalidade *</Text>
        <View style={styles.buttonGroup}>
          {["Boxe", "Jiu-jitsu", "Muay Thai"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.optionButton,
                modalidade === item && styles.selected,
              ]}
              onPress={() => setModalidade(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  modalidade === item && styles.selectedText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Plano *</Text>
        <View style={styles.buttonGroup}>
          {["Mensal", "Trimestral", "Anual"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.optionButton,
                plano === item && styles.selected,
              ]}
              onPress={() => setPlano(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  plano === item && styles.selectedText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Data de Início *</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowPicker(true)}
        >
          <Text style={{ color: dataInicio ? "#000" : "#aaa" }}>
            {dataInicio || "Selecionar data"}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              setShowPicker(false);
              if (date) {
                const formatted = `${String(date.getDate()).padStart(
                  2,
                  "0"
                )}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
                setDataInicio(formatted);
              }
            }}
          />
        )}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleRegisterAluno}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Cadastrando..." : "Cadastrar Aluno"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80,
    backgroundColor: "#f9f9f9",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 18,
    borderRadius: 8,
    backgroundColor: "white",
    fontSize: 16,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 15,
    borderRadius: 10,
  },
  photoButton: {
    backgroundColor: "#e0e0e0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  photoButtonText: {
    color: "#0066cc",
    fontWeight: "500",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#0066cc",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    margin: 5,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  selected: {
    backgroundColor: "#0066cc",
    borderColor: "#0066cc",
  },
  optionText: {
    fontSize: 16,
  },
  selectedText: {
    color: "white",
    fontWeight: "500",
  },
});
