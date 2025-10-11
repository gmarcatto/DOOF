import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  notes?: string;
}

interface Restaurant {
  id: string;
  name: string;
  deliveryFee: number;
  minimumOrder: number;
}

interface CartContextType {
  items: CartItem[];
  restaurant: Restaurant | null;
  addItem: (item: CartItem, restaurant: Restaurant) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const addItem = (item: CartItem, newRestaurant: Restaurant) => {
    // If cart has items from different restaurant, clear it
    if (restaurant && restaurant.id !== newRestaurant.id) {
      const confirm = window.confirm(
        'Seu carrinho contém itens de outro restaurante. Deseja limpar o carrinho?'
      );
      if (!confirm) return;
      setItems([]);
    }

    setRestaurant(newRestaurant);

    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.productId === item.productId);
      
      if (existingItem) {
        return prevItems.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      
      return [...prevItems, item];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
    
    // If cart is empty, clear restaurant
    if (items.length === 1) {
      setRestaurant(null);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurant(null);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const deliveryFee = restaurant?.deliveryFee || 0;
    return subtotal + deliveryFee;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        restaurant,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};




