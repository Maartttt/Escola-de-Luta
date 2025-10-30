import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, Alert, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AlunoFormScreen from '../screens/AlunoFormScreen';
import AlunoEditScreen from '../screens/AlunoEditScreen';
import UsuariosScreen from '../screens/UsuariosScreen';
import UsuarioEdit from '../screens/UsuarioEdit';
import { supabase } from '../services/supabase';

const Stack = createNativeStackNavigator();

// Definindo tipos para as rotas
type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Register: undefined;
  AlunoForm: undefined;
  AlunoEdit: { aluno: any };
  Usuarios: undefined;
  UsuarioEdit: { usuario: any };
};

// Tipo para as props de navegação
type NavigationProps = NativeStackScreenProps<RootStackParamList, keyof RootStackParamList>;

export default function AppNavigator() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<'master' | 'professor' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('Iniciando busca de usuário...');
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.log('Nenhuma sessão ativa:', error.message);
          // Se não há sessão, isso é normal - usuário deve fazer login
          setUser(null);
        } else {
          console.log('Usuário encontrado:', data?.user ? 'Sim' : 'Não');
          setUser(data?.user || null);
        }
      } catch (e: any) {
        console.error('Exceção ao buscar usuário:', e.message);
        // Em caso de erro inesperado, ainda permite ir para login
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;
      
      try {
        console.log('Buscando role para usuário:', user.id);
        const { data, error } = await supabase
          .from('usuarios')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar role:', error.message);
          Alert.alert('Erro', 'Não foi possível carregar seu perfil: ' + error.message);
        } else {
          console.log('Role encontrada:', data?.role || 'nenhuma');
          setRole(data?.role || null);
        }
      } catch (e: any) {
        console.error('Exceção ao buscar role:', e.message);
      }
    };
    
    fetchRole();
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', fontSize: 16, marginBottom: 10 }}>Erro ao carregar o aplicativo:</Text>
        <Text style={{ textAlign: 'center' }}>{error}</Text>
        <View style={{ marginTop: 20 }}>
          <Button title="Tentar novamente" onPress={() => {
            setLoading(true);
            setError(null);
            setTimeout(() => {
              supabase.auth.getUser().then(({ data, error }) => {
                if (error) {
                  console.log('Nenhuma sessão ativa, indo para login');
                  setUser(null);
                } else {
                  setUser(data?.user || null);
                }
                setLoading(false);
              });
            }, 1000);
          }} />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {/* Login */}
        {!user && (
          <Stack.Screen name="Login">
            {(props: NativeStackScreenProps<RootStackParamList, 'Login'>) => <LoginScreen {...props} setUser={setUser} />}
          </Stack.Screen>
        )}

        {/* Dashboard */}
        {user && (
          <Stack.Screen name="Dashboard">
            {(props: NativeStackScreenProps<RootStackParamList, 'Dashboard'>) => <DashboardScreen {...props} user={user} role={role} />}
          </Stack.Screen>
        )}

        {/* Register - apenas Master */}
        {user && role === 'master' && (
          <Stack.Screen name="Register">
            {(props: NativeStackScreenProps<RootStackParamList, 'Register'>) => <RegisterScreen {...props} user={user} role={role} />}
          </Stack.Screen>
        )}

        {/* Cadastro de Alunos */}
        {user && (
          <Stack.Screen name="AlunoForm">
            {(props: NativeStackScreenProps<RootStackParamList, 'AlunoForm'>) => <AlunoFormScreen {...props} user={user} role={role} />}
          </Stack.Screen>
        )}

        {/* Edição de Alunos - apenas Master */}
        {user && role === 'master' && (
          <Stack.Screen name="AlunoEdit">
            {(props: NativeStackScreenProps<RootStackParamList, 'AlunoEdit'>) => <AlunoEditScreen {...props} user={user} role={role} />}
          </Stack.Screen>
        )}

        {/* Lista de Usuários - apenas Master */}
        {user && role === 'master' && (
          <Stack.Screen name="Usuarios" component={UsuariosScreen} />
        )}

        {/* Edição de Usuário - apenas Master */}
        {user && role === 'master' && (
          <Stack.Screen name="UsuarioEdit" component={UsuarioEdit} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
