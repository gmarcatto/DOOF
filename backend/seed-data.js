// Script para popular o banco com dados de exemplo
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/doof')
  .then(async () => {
    console.log('✅ Conectado ao MongoDB');
    
    // Models
    const User = mongoose.model('User', require('./dist/models/User').default.schema);
    const Restaurant = mongoose.model('Restaurant', require('./dist/models/Restaurant').default.schema);
    const Product = mongoose.model('Product', require('./dist/models/Product').default.schema);
    
    // Criar usuário restaurante
    const restaurantOwner = await User.create({
      name: 'Dono de Restaurante',
      email: 'restaurante@doof.com',
      password: await bcrypt.hash('123456', 10),
      role: 'restaurant',
      authProvider: 'local',
    });
    
    console.log('✅ Usuário restaurante criado');
    
    // Criar restaurantes
    const pizzaria = await Restaurant.create({
      name: 'Pizzaria Bella Napoli',
      description: 'As melhores pizzas artesanais da cidade!',
      category: ['Pizza', 'Italiana'],
      phone: '(11) 98765-4321',
      email: 'contato@bellnapoli.com',
      owner: restaurantOwner._id,
      address: {
        street: 'Rua das Pizzas',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
      },
      deliveryFee: 5.00,
      minimumOrder: 25.00,
      averageDeliveryTime: 40,
      rating: 4.8,
      totalReviews: 150,
      isActive: true,
    });
    
    const burguer = await Restaurant.create({
      name: 'Burger House',
      description: 'Hambúrgueres artesanais suculentos',
      category: ['Hambúrguer', 'Lanches'],
      phone: '(11) 91234-5678',
      email: 'contato@burgerhouse.com',
      owner: restaurantOwner._id,
      address: {
        street: 'Avenida dos Burgers',
        number: '456',
        neighborhood: 'Jardins',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01456-789',
      },
      deliveryFee: 3.00,
      minimumOrder: 20.00,
      averageDeliveryTime: 30,
      rating: 4.9,
      totalReviews: 200,
      isActive: true,
    });
    
    console.log('✅ Restaurantes criados');
    
    // Criar produtos para a pizzaria
    await Product.create([
      {
        restaurant: pizzaria._id,
        name: 'Pizza Margherita',
        description: 'Molho de tomate, mussarela, manjericão fresco',
        category: 'Pizza',
        price: 35.00,
        available: true,
        preparationTime: 30,
      },
      {
        restaurant: pizzaria._id,
        name: 'Pizza Calabresa',
        description: 'Molho de tomate, mussarela, calabresa fatiada, cebola',
        category: 'Pizza',
        price: 38.00,
        available: true,
        preparationTime: 30,
      },
      {
        restaurant: pizzaria._id,
        name: 'Pizza Quatro Queijos',
        description: 'Mussarela, gorgonzola, parmesão, provolone',
        category: 'Pizza',
        price: 42.00,
        available: true,
        preparationTime: 30,
      },
      {
        restaurant: pizzaria._id,
        name: 'Refrigerante 2L',
        description: 'Coca-Cola, Guaraná ou Fanta',
        category: 'Bebidas',
        price: 10.00,
        available: true,
        preparationTime: 5,
      },
    ]);
    
    // Criar produtos para burger house
    await Product.create([
      {
        restaurant: burguer._id,
        name: 'Burger Classic',
        description: 'Pão, hambúrguer 180g, queijo, alface, tomate, cebola',
        category: 'Hambúrguer',
        price: 25.00,
        available: true,
        preparationTime: 20,
      },
      {
        restaurant: burguer._id,
        name: 'Burger Bacon',
        description: 'Pão, hambúrguer 180g, queijo, bacon crocante, cebola crispy',
        category: 'Hambúrguer',
        price: 30.00,
        available: true,
        preparationTime: 20,
      },
      {
        restaurant: burguer._id,
        name: 'Burger Duplo',
        description: 'Pão, 2 hambúrgueres 180g, queijo duplo, picles, molho especial',
        category: 'Hambúrguer',
        price: 35.00,
        available: true,
        preparationTime: 25,
      },
      {
        restaurant: burguer._id,
        name: 'Batata Frita Grande',
        description: 'Porção generosa de batatas crocantes',
        category: 'Acompanhamentos',
        price: 15.00,
        available: true,
        preparationTime: 10,
      },
      {
        restaurant: burguer._id,
        name: 'Milkshake de Chocolate',
        description: 'Cremoso milkshake com sorvete e calda de chocolate',
        category: 'Bebidas',
        price: 18.00,
        available: true,
        preparationTime: 5,
      },
    ]);
    
    console.log('✅ Produtos criados');
    console.log('🎉 Banco de dados populado com sucesso!');
    console.log('');
    console.log('📊 Resumo:');
    console.log('  - 1 usuário restaurante');
    console.log('  - 2 restaurantes');
    console.log('  - 9 produtos');
    console.log('');
    console.log('Acesse: http://localhost:3000/restaurants');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });




