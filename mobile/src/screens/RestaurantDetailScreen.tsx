import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import * as restaurantService from '../services/restaurantService';
import { Restaurant } from '../services/restaurantService';

type RestaurantDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RestaurantDetail'>;
type RestaurantDetailScreenRouteProp = RouteProp<RootStackParamList, 'RestaurantDetail'>;

interface Props {
  navigation: RestaurantDetailScreenNavigationProp;
  route: RestaurantDetailScreenRouteProp;
}

const RestaurantDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { restaurantId } = route.params;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurant();
  }, [restaurantId]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getRestaurantById(restaurantId);
      setRestaurant(data);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao carregar restaurante');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.centerContainer}>
        <Text>Restaurante não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{restaurant.name}</Text>
          {restaurant.rating !== undefined && (
            <Text style={styles.rating}>⭐ {restaurant.rating.toFixed(1)}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.text}>{restaurant.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <Text style={styles.text}>{restaurant.category.join(', ')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contato</Text>
          <Text style={styles.text}>📞 {restaurant.phone}</Text>
          <Text style={styles.text}>✉️ {restaurant.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valores</Text>
          <Text style={styles.text}>Taxa de entrega: R$ {restaurant.deliveryFee.toFixed(2)}</Text>
          <Text style={styles.text}>Pedido mínimo: R$ {restaurant.minimumOrder.toFixed(2)}</Text>
          {restaurant.averageDeliveryTime && (
            <Text style={styles.text}>
              Tempo médio de entrega: {restaurant.averageDeliveryTime} minutos
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço</Text>
          <Text style={styles.text}>
            {restaurant.address.street}, {restaurant.address.number}
            {restaurant.address.complement && ` - ${restaurant.address.complement}`}
          </Text>
          <Text style={styles.text}>
            {restaurant.address.neighborhood}, {restaurant.address.city} - {restaurant.address.state}
          </Text>
          <Text style={styles.text}>CEP: {restaurant.address.zipCode}</Text>
          {restaurant.address.placeName && (
            <Text style={styles.text}>📍 {restaurant.address.placeName}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <Text style={styles.text}>
            {restaurant.isActive ? '🟢 Ativo' : '🔴 Inativo'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('RestaurantForm', { restaurantId: restaurant._id })}
        >
          <Text style={styles.editButtonText}>Editar Restaurante</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  content: {
    padding: 15,
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  rating: {
    fontSize: 18,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RestaurantDetailScreen;

