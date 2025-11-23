import { Response } from 'express';
import Order from '../models/Order';
import Restaurant from '../models/Restaurant';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// Get all orders
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, customer, restaurant } = req.query;
    const filter: any = {};

    // Apply filters based on user role
    if (req.user?.role === 'customer') {
      filter.customer = req.user._id;
    } else if (req.user?.role === 'restaurant') {
      // Buscar o restaurante do usuário logado
      const userRestaurant = await Restaurant.findOne({ owner: req.user._id });
      if (userRestaurant) {
        filter.restaurant = userRestaurant._id;
      } else {
        // Se não encontrar restaurante, retornar array vazio
        res.json({ orders: [] });
        return;
      }
    }

    if (status) {
      filter.status = status;
    }

    if (customer && req.user?.role === 'admin') {
      filter.customer = customer;
    }

    if (restaurant && req.user?.role === 'admin') {
      filter.restaurant = restaurant;
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name logo phone')
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get single order
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name logo phone address')
      .populate('items.product', 'name image');

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    console.log('🔍 Verificando autorização para pedido:', req.params.id);
    console.log('   User role:', req.user?.role);
    console.log('   User ID:', req.user?._id.toString());
    console.log('   Order customer:', order.customer._id ? order.customer._id.toString() : order.customer.toString());

    // Check authorization
    const customerId = order.customer._id ? order.customer._id.toString() : order.customer.toString();
    const userId = req.user?._id.toString();

    if (
      req.user?.role !== 'admin' &&
      customerId !== userId
    ) {
      console.log('❌ Não é o cliente, verificando se é dono do restaurante...');
      // Check if user is restaurant owner
      const restaurantId = order.restaurant._id ? order.restaurant._id.toString() : order.restaurant.toString();
      const restaurant = await Restaurant.findById(restaurantId);
      
      if (
        !restaurant ||
        restaurant.owner.toString() !== userId
      ) {
        console.log('❌ Não autorizado!');
        res.status(403).json({ error: 'Not authorized' });
        return;
      }
      console.log('✅ É dono do restaurante');
    } else {
      console.log('✅ Autorizado (é o cliente ou admin)');
    }

    res.json({ order });
  } catch (error: any) {
    console.log('❌ Erro ao buscar pedido:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Create order
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { restaurant, items, deliveryType, deliveryAddress, pickupAddress, paymentMethod } = req.body;

    // Verify restaurant
    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    // Verify products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        res.status(404).json({ error: `Product ${item.product} not found` });
        return;
      }

      if (!product.available) {
        res.status(400).json({ error: `Product ${product.name} is not available` });
        return;
      }

      if (product.restaurant.toString() !== restaurant) {
        res.status(400).json({ error: 'All products must be from the same restaurant' });
        return;
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        notes: item.notes,
      });
    }

    // Calculate delivery fee based on delivery type
    const deliveryFee = deliveryType === 'pickup' ? 0 : restaurantDoc.deliveryFee;
    const total = subtotal + deliveryFee;

    // Check minimum order
    if (subtotal < restaurantDoc.minimumOrder) {
      res.status(400).json({
        error: `Minimum order value is R$ ${restaurantDoc.minimumOrder.toFixed(2)}`,
      });
      return;
    }

    // Validate delivery type and required data
    if (deliveryType === 'delivery' && !deliveryAddress) {
      res.status(400).json({ error: 'Delivery address is required for delivery orders' });
      return;
    }

    if (deliveryType === 'pickup' && !pickupAddress) {
      res.status(400).json({ error: 'Pickup address is required for pickup orders' });
      return;
    }

    // Calculate estimated delivery time based on delivery type
    const estimatedDeliveryTime = new Date();
    if (deliveryType === 'delivery') {
      estimatedDeliveryTime.setMinutes(
        estimatedDeliveryTime.getMinutes() + restaurantDoc.averageDeliveryTime
      );
    } else {
      // For pickup, add preparation time + 15 minutes buffer
      estimatedDeliveryTime.setMinutes(
        estimatedDeliveryTime.getMinutes() + Math.max(...items.map(item => item.preparationTime || 20)) + 15
      );
    }

    // Create order
    const order = await Order.create({
      customer: req.user?._id,
      restaurant,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      deliveryType,
      deliveryAddress,
      pickupAddress,
      paymentMethod,
      status: 'pending',
      estimatedDeliveryTime,
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          note: deliveryType === 'pickup' ? 'Order placed - Pickup' : 'Order placed',
        },
      ],
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name logo phone')
      .populate('items.product', 'name image');

    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Se o cliente está tentando cancelar seu próprio pedido
    const customerId = order.customer._id ? order.customer._id.toString() : order.customer.toString();
    const isOwnOrder = customerId === req.user?._id.toString();
    
    console.log('🔍 Verificando permissão para atualizar status:', {
      novoStatus: status,
      statusAtual: order.status,
      userRole: req.user?.role,
      isOwnOrder
    });
    
    if (status === 'cancelled' && isOwnOrder) {
      // Cliente pode cancelar apenas se ainda não estiver em entrega ou finalizado
      const finalStatuses = ['in_delivery', 'delivered', 'picked_up', 'cancelled'];
      if (finalStatuses.includes(order.status)) {
        console.log('❌ Cliente não pode cancelar - pedido já está em:', order.status);
        res.status(403).json({ error: 'Não é possível cancelar este pedido neste momento' });
        return;
      }
      console.log('✅ Cliente pode cancelar seu próprio pedido');
      // Permitir cancelamento
    } else {
      // Para outras mudanças de status, verificar se é dono do restaurante ou admin
      const restaurant = await Restaurant.findById(order.restaurant);
      if (
        req.user?.role !== 'admin' &&
        (!restaurant || restaurant.owner.toString() !== req.user?._id.toString())
      ) {
        console.log('❌ Usuário não autorizado para mudar status');
        res.status(403).json({ error: 'Not authorized' });
        return;
      }
      console.log('✅ Restaurante/Admin pode mudar status');
    }

    // Update order status
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note,
    });

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name logo phone')
      .populate('items.product', 'name image');

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel order
export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Check authorization
    if (
      req.user?.role !== 'admin' &&
      order.customer.toString() !== req.user?._id.toString()
    ) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Only allow cancellation if order is not delivered
    if (order.status === 'delivered') {
      res.status(400).json({ error: 'Cannot cancel delivered order' });
      return;
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: req.body.reason || 'Cancelled by customer',
    });

    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get invoice for order
export const getInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('restaurant', 'name email phone address');

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Check authorization
    const customerId = order.customer._id ? order.customer._id.toString() : order.customer.toString();
    const userId = req.user?._id.toString();

    if (
      req.user?.role !== 'admin' &&
      customerId !== userId
    ) {
      // Check if user is restaurant owner
      const restaurantId = order.restaurant._id ? order.restaurant._id.toString() : order.restaurant.toString();
      const restaurant = await Restaurant.findById(restaurantId);
      
      if (
        !restaurant ||
        restaurant.owner.toString() !== userId
      ) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }
    }

    // Format payment method label
    const paymentMethodLabels: Record<string, string> = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      cash: 'Dinheiro',
      pix: 'PIX',
    };

    // Format invoice data
    const invoice = {
      orderNumber: order.orderNumber,
      orderId: order._id.toString(),
      orderDate: order.createdAt.toISOString(),
      orderStatus: order.status,
      customer: {
        name: (order.customer as any).name,
        email: (order.customer as any).email,
        phone: (order.customer as any).phone || '',
        cpf: null, // CPF não está no modelo User
        address: (order.customer as any).address || null,
      },
      restaurant: {
        name: (order.restaurant as any).name,
        email: (order.restaurant as any).email,
        phone: (order.restaurant as any).phone,
        cnpj: null, // CNPJ não está no modelo Restaurant
        address: (order.restaurant as any).address || null,
      },
      items: order.items.map((item) => ({
        productId: item.product.toString(),
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        notes: item.notes || null,
      })),
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: 0, // Desconto não está implementado
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentMethodLabel: paymentMethodLabels[order.paymentMethod] || order.paymentMethod,
      deliveryType: order.deliveryType,
      deliveryAddress: order.deliveryAddress || null,
      pickupAddress: order.pickupAddress || null,
      estimatedDeliveryTime: order.estimatedDeliveryTime.toISOString(),
      statusHistory: order.statusHistory,
    };

    res.json({ invoice });
  } catch (error: any) {
    console.error('Error getting invoice:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar nota fiscal' });
  }
};

