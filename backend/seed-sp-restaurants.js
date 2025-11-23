// Script para adicionar 20 restaurantes em São Paulo com coordenadas
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar ao MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/doof';
mongoose.connect(mongoUri)
  .then(async () => {
    console.log('✅ Conectado ao MongoDB');
    
    // Models
    const User = mongoose.model('User', require('./dist/models/User').default.schema);
    const Restaurant = mongoose.model('Restaurant', require('./dist/models/Restaurant').default.schema);
    const Product = mongoose.model('Product', require('./dist/models/Product').default.schema);
    
    // Verificar se já existem restaurantes
    const existingCount = await Restaurant.countDocuments();
    console.log(`📊 Restaurantes existentes: ${existingCount}`);
    
    // Criar usuários para os restaurantes (se não existirem)
    const restaurantEmails = [
      'pizzaria@doof.com',
      'burger@doof.com',
      'sushi@doof.com',
      'italiana@doof.com',
      'churrasco@doof.com',
      'mexicana@doof.com',
      'arabe@doof.com',
      'vegetariano@doof.com',
      'acai@doof.com',
      'sorvete@doof.com',
      'cafe@doof.com',
      'padaria@doof.com',
      'frutos@doof.com',
      'massas@doof.com',
      'oriental@doof.com',
      'petiscos@doof.com',
      'doces@doof.com',
      'salgados@doof.com',
      'sucos@doof.com',
      'tapioca@doof.com',
    ];

    const restaurantUsers = [];
    for (const email of restaurantEmails) {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name: `Dono ${email.split('@')[0]}`,
          email: email,
          password: await bcrypt.hash('123456', 10),
          role: 'restaurant',
          authProvider: 'local',
        });
      }
      restaurantUsers.push(user);
    }
    
    console.log('✅ Usuários restaurantes verificados/criados');
    
    // Coordenadas de diferentes bairros de São Paulo
    const saoPauloLocations = [
      // Centro
      { lat: -23.5505, lng: -46.6333, neighborhood: 'Centro', street: 'Rua Augusta', number: '100' },
      { lat: -23.5431, lng: -46.6426, neighborhood: 'República', street: 'Av. São João', number: '200' },
      { lat: -23.5489, lng: -46.6388, neighborhood: 'Bela Vista', street: 'Rua dos Três Irmãos', number: '300' },
      
      // Zona Sul
      { lat: -23.6275, lng: -46.6417, neighborhood: 'Vila Mariana', street: 'Rua Domingos de Morais', number: '400' },
      { lat: -23.6505, lng: -46.6253, neighborhood: 'Moema', street: 'Av. Ibirapuera', number: '500' },
      { lat: -23.6167, lng: -46.6667, neighborhood: 'Vila Olímpia', street: 'Rua Funchal', number: '600' },
      { lat: -23.6000, lng: -46.6833, neighborhood: 'Brooklin', street: 'Av. Santo Amaro', number: '700' },
      { lat: -23.6333, lng: -46.7000, neighborhood: 'Campo Belo', street: 'Rua Bandeira Paulista', number: '800' },
      
      // Zona Oeste
      { lat: -23.5667, lng: -46.7000, neighborhood: 'Pinheiros', street: 'Rua dos Pinheiros', number: '900' },
      { lat: -23.5500, lng: -46.6833, neighborhood: 'Vila Madalena', street: 'Rua Harmonia', number: '1000' },
      { lat: -23.5333, lng: -46.6667, neighborhood: 'Perdizes', street: 'Rua Cardoso de Almeida', number: '1100' },
      { lat: -23.5167, lng: -46.6500, neighborhood: 'Barra Funda', street: 'Av. Marquês de São Vicente', number: '1200' },
      
      // Zona Norte
      { lat: -23.5000, lng: -46.6167, neighborhood: 'Santana', street: 'Av. Engenheiro Caetano Álvares', number: '1300' },
      { lat: -23.4833, lng: -46.6000, neighborhood: 'Tucuruvi', street: 'Rua Coronel Sezefredo Fagundes', number: '1400' },
      { lat: -23.4667, lng: -46.5833, neighborhood: 'Vila Guilherme', street: 'Av. Guilherme', number: '1500' },
      
      // Zona Leste
      { lat: -23.5500, lng: -46.5500, neighborhood: 'Tatuapé', street: 'Rua Tuiuti', number: '1600' },
      { lat: -23.5333, lng: -46.5333, neighborhood: 'Mooca', street: 'Rua da Mooca', number: '1700' },
      { lat: -23.5167, lng: -46.5167, neighborhood: 'Belém', street: 'Av. Celso Garcia', number: '1800' },
      { lat: -23.5000, lng: -46.5000, neighborhood: 'Brás', street: 'Rua dos Três Irmãos', number: '1900' },
      { lat: -23.4833, lng: -46.4833, neighborhood: 'Penha', street: 'Av. Penha de França', number: '2000' },
    ];
    
    // Tipos de restaurantes variados
    const restaurantData = [
      {
        name: 'Pizzaria Bella Vista',
        description: 'Pizzas artesanais no forno a lenha',
        category: ['Pizza', 'Italiana'],
        email: 'pizzaria@doof.com',
        phone: '(11) 98765-4321',
        deliveryFee: 5.00,
        minimumOrder: 25.00,
        averageDeliveryTime: 35,
        rating: 4.7,
        totalReviews: 180,
      },
      {
        name: 'Burger House Premium',
        description: 'Hambúrgueres gourmet com ingredientes selecionados',
        category: ['Hambúrguer', 'Lanches'],
        email: 'burger@doof.com',
        phone: '(11) 91234-5678',
        deliveryFee: 4.00,
        minimumOrder: 30.00,
        averageDeliveryTime: 25,
        rating: 4.8,
        totalReviews: 220,
      },
      {
        name: 'Sushi Master',
        description: 'Sushi e sashimi frescos preparados por chef japonês',
        category: ['Japonês', 'Sushi', 'Sashimi'],
        email: 'sushi@doof.com',
        phone: '(11) 99876-5432',
        deliveryFee: 8.00,
        minimumOrder: 50.00,
        averageDeliveryTime: 40,
        rating: 4.9,
        totalReviews: 350,
      },
      {
        name: 'Trattoria Italiana',
        description: 'Massas artesanais e pratos tradicionais italianos',
        category: ['Italiana', 'Massa'],
        email: 'italiana@doof.com',
        phone: '(11) 95555-1234',
        deliveryFee: 6.00,
        minimumOrder: 35.00,
        averageDeliveryTime: 30,
        rating: 4.6,
        totalReviews: 150,
      },
      {
        name: 'Churrascaria Gaúcha',
        description: 'Autêntico churrasco gaúcho com carnes nobres',
        category: ['Churrasco', 'Carnes', 'Brasileira'],
        email: 'churrasco@doof.com',
        phone: '(11) 94444-5555',
        deliveryFee: 7.00,
        minimumOrder: 45.00,
        averageDeliveryTime: 45,
        rating: 4.7,
        totalReviews: 200,
      },
      {
        name: 'Tacos El Mariachi',
        description: 'Tacos autênticos e comida mexicana tradicional',
        category: ['Mexicana', 'Tacos'],
        email: 'mexicana@doof.com',
        phone: '(11) 93333-6666',
        deliveryFee: 5.00,
        minimumOrder: 28.00,
        averageDeliveryTime: 30,
        rating: 4.5,
        totalReviews: 120,
      },
      {
        name: 'Kebab Express',
        description: 'Kebabs tradicionais e comida árabe',
        category: ['Árabe', 'Kebab'],
        email: 'arabe@doof.com',
        phone: '(11) 92222-7777',
        deliveryFee: 4.00,
        minimumOrder: 25.00,
        averageDeliveryTime: 25,
        rating: 4.4,
        totalReviews: 140,
      },
      {
        name: 'Salada Fresh',
        description: 'Saladas frescas e pratos saudáveis',
        category: ['Saudável', 'Saladas', 'Vegetariano'],
        email: 'vegetariano@doof.com',
        phone: '(11) 91111-8888',
        deliveryFee: 3.00,
        minimumOrder: 22.00,
        averageDeliveryTime: 20,
        rating: 4.3,
        totalReviews: 90,
      },
      {
        name: 'Açaí Tropical',
        description: 'Açaí cremoso e acompanhamentos tropicais',
        category: ['Açaí', 'Saudável', 'Tropical'],
        email: 'acai@doof.com',
        phone: '(11) 98888-1111',
        deliveryFee: 3.00,
        minimumOrder: 18.00,
        averageDeliveryTime: 15,
        rating: 4.5,
        totalReviews: 180,
      },
      {
        name: 'Sorvete Artesanal',
        description: 'Sorvetes artesanais com sabores únicos',
        category: ['Sorvete', 'Sobremesas'],
        email: 'sorvete@doof.com',
        phone: '(11) 97777-2222',
        deliveryFee: 3.00,
        minimumOrder: 20.00,
        averageDeliveryTime: 20,
        rating: 4.7,
        totalReviews: 160,
      },
      {
        name: 'Café Gourmet',
        description: 'Cafés especiais e lanches gourmet',
        category: ['Café', 'Lanches', 'Gourmet'],
        email: 'cafe@doof.com',
        phone: '(11) 96666-3333',
        deliveryFee: 3.00,
        minimumOrder: 20.00,
        averageDeliveryTime: 20,
        rating: 4.6,
        totalReviews: 170,
      },
      {
        name: 'Padaria Artesanal',
        description: 'Pães, bolos e salgados artesanais',
        category: ['Padaria', 'Lanches', 'Doces'],
        email: 'padaria@doof.com',
        phone: '(11) 95555-4444',
        deliveryFee: 2.00,
        minimumOrder: 15.00,
        averageDeliveryTime: 18,
        rating: 4.4,
        totalReviews: 130,
      },
      {
        name: 'Frutos do Mar',
        description: 'Pratos com frutos do mar frescos',
        category: ['Frutos do Mar', 'Peixe', 'Camarão'],
        email: 'frutos@doof.com',
        phone: '(11) 94444-5555',
        deliveryFee: 6.00,
        minimumOrder: 40.00,
        averageDeliveryTime: 35,
        rating: 4.8,
        totalReviews: 190,
      },
      {
        name: 'Massas da Nonna',
        description: 'Massas caseiras com receitas da nonna',
        category: ['Italiana', 'Massa'],
        email: 'massas@doof.com',
        phone: '(11) 93333-6666',
        deliveryFee: 5.00,
        minimumOrder: 32.00,
        averageDeliveryTime: 28,
        rating: 4.6,
        totalReviews: 145,
      },
      {
        name: 'Culinária Oriental',
        description: 'Pratos chineses, tailandeses e vietnamitas',
        category: ['Oriental', 'Chinesa', 'Tailandesa'],
        email: 'oriental@doof.com',
        phone: '(11) 92222-7777',
        deliveryFee: 5.00,
        minimumOrder: 30.00,
        averageDeliveryTime: 30,
        rating: 4.5,
        totalReviews: 125,
      },
      {
        name: 'Petiscos & Cia',
        description: 'Petiscos e porções para compartilhar',
        category: ['Petiscos', 'Porções', 'Brasileira'],
        email: 'petiscos@doof.com',
        phone: '(11) 91111-8888',
        deliveryFee: 4.00,
        minimumOrder: 35.00,
        averageDeliveryTime: 25,
        rating: 4.4,
        totalReviews: 110,
      },
      {
        name: 'Doces da Vovó',
        description: 'Doces caseiros e sobremesas tradicionais',
        category: ['Doces', 'Sobremesas', 'Confeitaria'],
        email: 'doces@doof.com',
        phone: '(11) 98888-9999',
        deliveryFee: 3.00,
        minimumOrder: 20.00,
        averageDeliveryTime: 15,
        rating: 4.7,
        totalReviews: 165,
      },
      {
        name: 'Salgados Premium',
        description: 'Salgados artesanais e coxinhas especiais',
        category: ['Salgados', 'Lanches', 'Brasileira'],
        email: 'salgados@doof.com',
        phone: '(11) 97777-0000',
        deliveryFee: 3.00,
        minimumOrder: 18.00,
        averageDeliveryTime: 20,
        rating: 4.5,
        totalReviews: 155,
      },
      {
        name: 'Sucos Naturais',
        description: 'Sucos naturais e vitaminas frescas',
        category: ['Sucos', 'Bebidas', 'Saudável'],
        email: 'sucos@doof.com',
        phone: '(11) 96666-1111',
        deliveryFee: 2.00,
        minimumOrder: 15.00,
        averageDeliveryTime: 12,
        rating: 4.3,
        totalReviews: 100,
      },
      {
        name: 'Tapiocaria Nordestina',
        description: 'Tapiocas tradicionais e comidas nordestinas',
        category: ['Tapioca', 'Nordestina', 'Lanches'],
        email: 'tapioca@doof.com',
        phone: '(11) 95555-2222',
        deliveryFee: 3.00,
        minimumOrder: 20.00,
        averageDeliveryTime: 18,
        rating: 4.6,
        totalReviews: 135,
      },
    ];
    
    // Criar restaurantes
    const restaurants = [];
    for (let i = 0; i < restaurantData.length && i < saoPauloLocations.length; i++) {
      const data = restaurantData[i];
      const location = saoPauloLocations[i];
      
      // Verificar se restaurante já existe
      let restaurant = await Restaurant.findOne({ email: data.email });
      
      if (!restaurant) {
        restaurant = await Restaurant.create({
          name: data.name,
          description: data.description,
          category: data.category,
          phone: data.phone,
          email: data.email,
          owner: restaurantUsers[i]._id,
          address: {
            street: location.street,
            number: location.number,
            neighborhood: location.neighborhood,
            city: 'São Paulo',
            state: 'SP',
            zipCode: '00000-000',
            coordinates: {
              latitude: location.lat,
              longitude: location.lng,
            },
          },
          openingHours: [
            { dayOfWeek: 0, open: '11:00', close: '23:00', closed: false },
            { dayOfWeek: 1, open: '11:00', close: '23:00', closed: false },
            { dayOfWeek: 2, open: '11:00', close: '23:00', closed: false },
            { dayOfWeek: 3, open: '11:00', close: '23:00', closed: false },
            { dayOfWeek: 4, open: '11:00', close: '23:00', closed: false },
            { dayOfWeek: 5, open: '11:00', close: '00:00', closed: false },
            { dayOfWeek: 6, open: '11:00', close: '00:00', closed: false },
          ],
          deliveryFee: data.deliveryFee,
          minimumOrder: data.minimumOrder,
          averageDeliveryTime: data.averageDeliveryTime,
          rating: data.rating,
          totalReviews: data.totalReviews,
          isActive: true,
        });
        restaurants.push(restaurant);
        console.log(`✅ Restaurante criado: ${restaurant.name} - ${location.neighborhood}`);
      } else {
        // Atualizar coordenadas se não tiver
        if (!restaurant.address.coordinates?.latitude) {
          restaurant.address.coordinates = {
            latitude: location.lat,
            longitude: location.lng,
          };
          await restaurant.save();
          console.log(`✅ Coordenadas atualizadas: ${restaurant.name}`);
        } else {
          console.log(`⏭️  Restaurante já existe: ${restaurant.name}`);
        }
        restaurants.push(restaurant);
      }
    }
    
    console.log('');
    console.log('🎉 Processo concluído!');
    console.log(`📊 Total de restaurantes processados: ${restaurants.length}`);
    console.log('');
    console.log('🏪 Restaurantes em São Paulo:');
    restaurants.forEach((r, index) => {
      const coords = r.address.coordinates;
      console.log(`  ${index + 1}. ${r.name} - ${r.address.neighborhood} (${coords?.latitude}, ${coords?.longitude})`);
    });
    console.log('');
    console.log('Acesse: http://localhost:3000/restaurants');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });




