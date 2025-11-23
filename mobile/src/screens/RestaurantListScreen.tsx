import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import * as restaurantService from '../services/restaurantService';
import { Restaurant } from '../services/restaurantService';

type RestaurantListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RestaurantList'>;

interface Props {
  navigation: RestaurantListScreenNavigationProp;
}

const RestaurantListScreen: React.FC<Props> = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRestaurants = useCallback(async () => {
    try {
      const data = await restaurantService.getAllRestaurants();
      setRestaurants(data);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao carregar restaurantes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRestaurants();
  }, [loadRestaurants]);

  const handleDelete = (restaurant: Restaurant) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir o restaurante "${restaurant.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              if (restaurant._id) {
                await restaurantService.deleteRestaurant(restaurant._id);
                loadRestaurants();
                Alert.alert('Sucesso', 'Restaurante excluído com sucesso');
              }
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao excluir restaurante');
            }
          },
        },
      ]
    );
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item._id! })}
    >
      <View style={styles.restaurantHeader}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        {item.rating !== undefined && (
          <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
        )}
      </View>
      <Text style={styles.restaurantDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.restaurantInfo}>
        <Text style={styles.category}>{item.category.join(', ')}</Text>
        <Text style={styles.deliveryFee}>
          Taxa: R$ {item.deliveryFee.toFixed(2)}
        </Text>
      </View>
      <View style={styles.restaurantFooter}>
        <Text style={styles.status}>
          {item.isActive ? '🟢 Ativo' : '🔴 Inativo'}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate('RestaurantForm', { restaurantId: item._id })
            }
          >
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando restaurantes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('RestaurantForm')}
        >
          <Text style={styles.addButtonText}>+ Novo Restaurante</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item._id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum restaurante encontrado</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('RestaurantForm')}
            >
              <Text style={styles.emptyButtonText}>Criar primeiro restaurante</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
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
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  list: {
    padding: 15,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  rating: {
    fontSize: 14,
    color: '#666',
  },
  restaurantDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  restaurantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  category: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  deliveryFee: {
    fontSize: 12,
    color: '#666',
  },
  restaurantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default RestaurantListScreen;
