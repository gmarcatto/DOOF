import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import * as restaurantService from '../services/restaurantService';
import { Restaurant } from '../services/restaurantService';

type RestaurantFormScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RestaurantForm'>;
type RestaurantFormScreenRouteProp = RouteProp<RootStackParamList, 'RestaurantForm'>;

interface Props {
  navigation: RestaurantFormScreenNavigationProp;
  route: RestaurantFormScreenRouteProp;
}

const RestaurantFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const { restaurantId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Restaurant>({
    name: '',
    description: '',
    category: [],
    phone: '',
    email: '',
    deliveryFee: 0,
    minimumOrder: 0,
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  useEffect(() => {
    if (restaurantId) {
      loadRestaurant();
    }
  }, [restaurantId]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      const restaurant = await restaurantService.getRestaurantById(restaurantId!);
      setFormData(restaurant);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao carregar restaurante');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validação básica
    if (!formData.name || !formData.description || !formData.phone || !formData.email) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!formData.category.length) {
      Alert.alert('Erro', 'Por favor, adicione pelo menos uma categoria');
      return;
    }

    if (!formData.address.street || !formData.address.number || !formData.address.neighborhood ||
        !formData.address.city || !formData.address.state || !formData.address.zipCode) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos do endereço');
      return;
    }

    try {
      setSaving(true);
      if (restaurantId) {
        await restaurantService.updateRestaurant(restaurantId, formData);
        Alert.alert('Sucesso', 'Restaurante atualizado com sucesso');
      } else {
        await restaurantService.createRestaurant(formData);
        Alert.alert('Sucesso', 'Restaurante criado com sucesso');
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao salvar restaurante');
    } finally {
      setSaving(false);
    }
  };

  const updateCategory = (text: string) => {
    const categories = text.split(',').map(c => c.trim()).filter(c => c);
    setFormData({ ...formData, category: categories });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome do restaurante *"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descrição *"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={3}
          />

          <TextInput
            style={styles.input}
            placeholder="Categorias (separadas por vírgula) *"
            value={formData.category.join(', ')}
            onChangeText={updateCategory}
          />

          <Text style={styles.sectionTitle}>Contato</Text>

          <TextInput
            style={styles.input}
            placeholder="Telefone *"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.sectionTitle}>Valores</Text>

          <TextInput
            style={styles.input}
            placeholder="Taxa de entrega (R$) *"
            value={formData.deliveryFee.toString()}
            onChangeText={(text) =>
              setFormData({ ...formData, deliveryFee: parseFloat(text) || 0 })
            }
            keyboardType="decimal-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Pedido mínimo (R$) *"
            value={formData.minimumOrder.toString()}
            onChangeText={(text) =>
              setFormData({ ...formData, minimumOrder: parseFloat(text) || 0 })
            }
            keyboardType="decimal-pad"
          />

          <Text style={styles.sectionTitle}>Endereço</Text>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.flex2]}
              placeholder="Rua *"
              value={formData.address.street}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, street: text },
                })
              }
            />
            <TextInput
              style={[styles.input, styles.flex1]}
              placeholder="Número *"
              value={formData.address.number}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, number: text },
                })
              }
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Complemento"
            value={formData.address.complement}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                address: { ...formData.address, complement: text },
              })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Bairro *"
            value={formData.address.neighborhood}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                address: { ...formData.address, neighborhood: text },
              })
            }
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.flex2]}
              placeholder="Cidade *"
              value={formData.address.city}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, city: text },
                })
              }
            />
            <TextInput
              style={[styles.input, styles.flex1]}
              placeholder="Estado *"
              value={formData.address.state}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, state: text.toUpperCase() },
                })
              }
              maxLength={2}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="CEP *"
            value={formData.address.zipCode}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                address: { ...formData.address, zipCode: text },
              })
            }
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.submitButton, saving && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {restaurantId ? 'Atualizar' : 'Criar'} Restaurante
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 15,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RestaurantFormScreen;

