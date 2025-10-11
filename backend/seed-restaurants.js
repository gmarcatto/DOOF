// Script para adicionar mais 10 restaurantes com produtos
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar ao MongoDB
mongoose.connect('mongodb://mongodb:27017/doof')
  .then(async () => {
    console.log('✅ Conectado ao MongoDB');
    
    // Models
    const User = mongoose.model('User', require('./dist/models/User').default.schema);
    const Restaurant = mongoose.model('Restaurant', require('./dist/models/Restaurant').default.schema);
    const Product = mongoose.model('Product', require('./dist/models/Product').default.schema);
    
    // Criar usuários para os restaurantes
    const restaurantUsers = await User.create([
      {
        name: 'João Sushi Master',
        email: 'sushi@doof.com',
        password: await bcrypt.hash('123456', 10),
        role: 'restaurant',
        authProvider: 'local',
      },
      {
        name: 'Maria Churrasqueira',
        email: 'churrasco@doof.com',
        password: await bcrypt.hash('123456', 10),
        role: 'restaurant',
        authProvider: 'local',
      },
      {
        name: 'Carlos Pasta Chef',
        email: 'italiano@doof.com',
        password: await bcrypt.hash('123456', 10),
        role: 'restaurant',
        authProvider: 'local',
      },
      {
        name: 'Ana Doces Chef',
        email: 'doces@doof.com',
        password: await bcrypt.hash('123456', 10),
        role: 'restaurant',
        authProvider: 'local',
      },
      {
        name: 'Pedro Acai Master',
        email: 'acai@doof.com',
        password: await bcrypt.hash('123456', 10),
        role: 'restaurant',
        authProvider: 'local',
      },
      {
        name: 'Lucia Tacos Chef',
        email: 'mexicano@doof.com',
        password: await bcrypt.hash('123456', 10),
        role: 'restaurant',
        authProvider: 'local',
      },
      {
        name: 'Roberto Salada Fresh',
        email: 'salada@doof.com',
        password: await bcrypt.hash('123456', 10),
        role: 'restaurant',
        authProvider: 'local',
      },
      {
        name: 'Fernanda Sorvete Art',
        email: 'sorvete@doof.com',
        password: await bcrypt.hash('123456', 10),
        role: 'restaurant',
        authProvider: 'local',
      },
      {
        name: 'Diego Kebab King',
        email: 'kebab@doof.com',
        password: await bcrypt.hash('123456', 10),
        role: 'restaurant',
        authProvider: 'local',
      },
      {
        name: 'Camila Café Gourmet',
        email: 'cafe@doof.com',
        password: await bcrypt.hash('123456', 10),
        role: 'restaurant',
        authProvider: 'local',
      }
    ]);
    
    console.log('✅ Usuários restaurantes criados');
    
    // Criar restaurantes
    const restaurants = await Restaurant.create([
      {
        name: 'Sushi Master',
        description: 'Sushi e sashimi frescos preparados por chef japonês',
        category: ['Japonês', 'Sushi', 'Sashimi'],
        phone: '(11) 98765-4321',
        email: 'sushi@doof.com',
        owner: restaurantUsers[0]._id,
        address: {
          street: 'Rua Liberdade',
          number: '123',
          neighborhood: 'Liberdade',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01508-000',
        },
        deliveryFee: 8.00,
        minimumOrder: 50.00,
        averageDeliveryTime: 45,
        rating: 4.9,
        totalReviews: 320,
        isActive: true,
      },
      {
        name: 'Churrasco do Gaúcho',
        description: 'Autêntico churrasco gaúcho com carnes nobres',
        category: ['Churrasco', 'Carnes', 'Brasileira'],
        phone: '(11) 91234-5678',
        email: 'churrasco@doof.com',
        owner: restaurantUsers[1]._id,
        address: {
          street: 'Av. Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
        },
        deliveryFee: 6.00,
        minimumOrder: 40.00,
        averageDeliveryTime: 50,
        rating: 4.7,
        totalReviews: 180,
        isActive: true,
      },
      {
        name: 'Pasta Italiana',
        description: 'Massas artesanais e molhos tradicionais italianos',
        category: ['Italiana', 'Massa', 'Europeia'],
        phone: '(11) 99876-5432',
        email: 'italiano@doof.com',
        owner: restaurantUsers[2]._id,
        address: {
          street: 'Rua Augusta',
          number: '456',
          neighborhood: 'Consolação',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01305-000',
        },
        deliveryFee: 5.00,
        minimumOrder: 35.00,
        averageDeliveryTime: 40,
        rating: 4.6,
        totalReviews: 250,
        isActive: true,
      },
      {
        name: 'Doces da Ana',
        description: 'Doces artesanais e sobremesas especiais',
        category: ['Doces', 'Sobremesas', 'Confeitaria'],
        phone: '(11) 95555-1234',
        email: 'doces@doof.com',
        owner: restaurantUsers[3]._id,
        address: {
          street: 'Rua Oscar Freire',
          number: '789',
          neighborhood: 'Jardins',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01426-001',
        },
        deliveryFee: 4.00,
        minimumOrder: 25.00,
        averageDeliveryTime: 30,
        rating: 4.8,
        totalReviews: 150,
        isActive: true,
      },
      {
        name: 'Açaí Tropical',
        description: 'Açaí cremoso e acompanhamentos tropicais',
        category: ['Açaí', 'Saudável', 'Tropical'],
        phone: '(11) 97777-8888',
        email: 'acai@doof.com',
        owner: restaurantUsers[4]._id,
        address: {
          street: 'Av. Ibirapuera',
          number: '234',
          neighborhood: 'Moema',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '04029-000',
        },
        deliveryFee: 3.00,
        minimumOrder: 20.00,
        averageDeliveryTime: 25,
        rating: 4.5,
        totalReviews: 200,
        isActive: true,
      },
      {
        name: 'Tacos El Mariachi',
        description: 'Tacos autênticos e comida mexicana tradicional',
        category: ['Mexicana', 'Tacos', 'Picante'],
        phone: '(11) 94444-5555',
        email: 'mexicano@doof.com',
        owner: restaurantUsers[5]._id,
        address: {
          street: 'Rua da Consolação',
          number: '567',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01302-000',
        },
        deliveryFee: 5.00,
        minimumOrder: 30.00,
        averageDeliveryTime: 35,
        rating: 4.4,
        totalReviews: 120,
        isActive: true,
      },
      {
        name: 'Salada Fresh',
        description: 'Saladas frescas e pratos saudáveis',
        category: ['Saudável', 'Saladas', 'Vegetariano'],
        phone: '(11) 93333-6666',
        email: 'salada@doof.com',
        owner: restaurantUsers[6]._id,
        address: {
          street: 'Av. Faria Lima',
          number: '890',
          neighborhood: 'Itaim Bibi',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '04538-132',
        },
        deliveryFee: 4.00,
        minimumOrder: 25.00,
        averageDeliveryTime: 30,
        rating: 4.3,
        totalReviews: 90,
        isActive: true,
      },
      {
        name: 'Sorvete Artesanal',
        description: 'Sorvetes artesanais com sabores únicos',
        category: ['Sorvete', 'Sobremesas', 'Gelato'],
        phone: '(11) 92222-7777',
        email: 'sorvete@doof.com',
        owner: restaurantUsers[7]._id,
        address: {
          street: 'Rua Haddock Lobo',
          number: '345',
          neighborhood: 'Cerqueira César',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01414-000',
        },
        deliveryFee: 3.00,
        minimumOrder: 20.00,
        averageDeliveryTime: 25,
        rating: 4.7,
        totalReviews: 160,
        isActive: true,
      },
      {
        name: 'Kebab Express',
        description: 'Kebabs tradicionais e comida árabe',
        category: ['Árabe', 'Kebab', 'Mediterrânea'],
        phone: '(11) 91111-9999',
        email: 'kebab@doof.com',
        owner: restaurantUsers[8]._id,
        address: {
          street: 'Rua 25 de Março',
          number: '678',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01021-000',
        },
        deliveryFee: 4.00,
        minimumOrder: 25.00,
        averageDeliveryTime: 30,
        rating: 4.5,
        totalReviews: 140,
        isActive: true,
      },
      {
        name: 'Café Gourmet',
        description: 'Cafés especiais e lanches gourmet',
        category: ['Café', 'Lanches', 'Gourmet'],
        phone: '(11) 98888-1111',
        email: 'cafe@doof.com',
        owner: restaurantUsers[9]._id,
        address: {
          street: 'Rua Bela Cintra',
          number: '901',
          neighborhood: 'Jardins',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01415-000',
        },
        deliveryFee: 3.00,
        minimumOrder: 20.00,
        averageDeliveryTime: 25,
        rating: 4.6,
        totalReviews: 180,
        isActive: true,
      }
    ]);
    
    console.log('✅ Restaurantes criados');
    
    // Criar produtos para cada restaurante
    const products = [];
    
    // Sushi Master
    products.push(...[
      {
        restaurant: restaurants[0]._id,
        name: 'Sashimi Salmão',
        description: 'Fatias frescas de salmão sashimi',
        category: 'Sashimi',
        price: 45.00,
        available: true,
        preparationTime: 15,
        ingredients: ['Salmão fresco', 'Gengibre', 'Wasabi'],
      },
      {
        restaurant: restaurants[0]._id,
        name: 'Sushi California',
        description: 'Sushi com caranguejo, abacate e pepino',
        category: 'Sushi',
        price: 32.00,
        available: true,
        preparationTime: 20,
        ingredients: ['Arroz', 'Caranguejo', 'Abacate', 'Pepino'],
      },
      {
        restaurant: restaurants[0]._id,
        name: 'Temaki Salmão',
        description: 'Cone de alga com arroz e salmão',
        category: 'Temaki',
        price: 28.00,
        available: true,
        preparationTime: 15,
        ingredients: ['Alga nori', 'Arroz', 'Salmão'],
      },
      {
        restaurant: restaurants[0]._id,
        name: 'Hot Roll',
        description: 'Sushi empanado com cream cheese e salmão',
        category: 'Hot Roll',
        price: 38.00,
        available: true,
        preparationTime: 25,
        ingredients: ['Arroz', 'Salmão', 'Cream cheese', 'Farofa panko'],
      },
      {
        restaurant: restaurants[0]._id,
        name: 'Missoshiro',
        description: 'Sopa tradicional japonesa',
        category: 'Sopa',
        price: 18.00,
        available: true,
        preparationTime: 10,
        ingredients: ['Missô', 'Tofu', 'Cebolinha'],
      },
      {
        restaurant: restaurants[0]._id,
        name: 'Refrigerante 350ml',
        description: 'Coca-Cola, Sprite ou Fanta',
        category: 'Bebidas',
        price: 8.00,
        available: true,
        preparationTime: 2,
      }
    ]);
    
    // Churrasco do Gaúcho
    products.push(...[
      {
        restaurant: restaurants[1]._id,
        name: 'Picanha na Chapa',
        description: 'Picanha grelhada na chapa, ponto escolhido',
        category: 'Carnes',
        price: 55.00,
        available: true,
        preparationTime: 30,
        ingredients: ['Picanha', 'Sal grosso', 'Alho'],
      },
      {
        restaurant: restaurants[1]._id,
        name: 'Costela de Boi',
        description: 'Costela assada lentamente por 8 horas',
        category: 'Carnes',
        price: 48.00,
        available: true,
        preparationTime: 35,
        ingredients: ['Costela de boi', 'Temperos especiais'],
      },
      {
        restaurant: restaurants[1]._id,
        name: 'Frango Grelhado',
        description: 'Frango temperado e grelhado na chapa',
        category: 'Aves',
        price: 35.00,
        available: true,
        preparationTime: 25,
        ingredients: ['Frango', 'Limão', 'Ervas'],
      },
      {
        restaurant: restaurants[1]._id,
        name: 'Arroz Carreteiro',
        description: 'Arroz com charque e ovos',
        category: 'Acompanhamentos',
        price: 22.00,
        available: true,
        preparationTime: 20,
        ingredients: ['Arroz', 'Charque', 'Ovos', 'Cebola'],
      },
      {
        restaurant: restaurants[1]._id,
        name: 'Salada Verde',
        description: 'Salada fresca com alface, tomate e cebola',
        category: 'Saladas',
        price: 15.00,
        available: true,
        preparationTime: 10,
        ingredients: ['Alface', 'Tomate', 'Cebola', 'Azeite'],
      },
      {
        restaurant: restaurants[1]._id,
        name: 'Cerveja 350ml',
        description: 'Cerveja gelada - Brahma, Skol ou Antarctica',
        category: 'Bebidas',
        price: 12.00,
        available: true,
        preparationTime: 2,
      }
    ]);
    
    // Pasta Italiana
    products.push(...[
      {
        restaurant: restaurants[2]._id,
        name: 'Spaghetti Carbonara',
        description: 'Massa com bacon, ovos e queijo parmesão',
        category: 'Massa',
        price: 42.00,
        available: true,
        preparationTime: 25,
        ingredients: ['Spaghetti', 'Bacon', 'Ovos', 'Parmesão'],
      },
      {
        restaurant: restaurants[2]._id,
        name: 'Lasanha Bolonhesa',
        description: 'Lasanha com molho à bolonhesa e queijo',
        category: 'Massa',
        price: 48.00,
        available: true,
        preparationTime: 40,
        ingredients: ['Massa lasanha', 'Carne moída', 'Molho tomate', 'Mussarela'],
      },
      {
        restaurant: restaurants[2]._id,
        name: 'Penne ao Pesto',
        description: 'Penne com molho pesto de manjericão',
        category: 'Massa',
        price: 38.00,
        available: true,
        preparationTime: 20,
        ingredients: ['Penne', 'Manjericão', 'Alho', 'Pinoli', 'Azeite'],
      },
      {
        restaurant: restaurants[2]._id,
        name: 'Risotto de Cogumelos',
        description: 'Risotto cremoso com cogumelos porcini',
        category: 'Risotto',
        price: 45.00,
        available: true,
        preparationTime: 30,
        ingredients: ['Arroz arbóreo', 'Cogumelos', 'Queijo parmesão'],
      },
      {
        restaurant: restaurants[2]._id,
        name: 'Tiramisu',
        description: 'Sobremesa italiana tradicional',
        category: 'Sobremesas',
        price: 25.00,
        available: true,
        preparationTime: 10,
        ingredients: ['Mascarpone', 'Café', 'Biscoito savoiardi', 'Cacau'],
      },
      {
        restaurant: restaurants[2]._id,
        name: 'Vinho Tinto 750ml',
        description: 'Vinho tinto seco da casa',
        category: 'Bebidas',
        price: 35.00,
        available: true,
        preparationTime: 2,
      }
    ]);
    
    // Doces da Ana
    products.push(...[
      {
        restaurant: restaurants[3]._id,
        name: 'Brigadeiro Gourmet',
        description: 'Brigadeiro artesanal com chocolate belga',
        category: 'Doces',
        price: 8.00,
        available: true,
        preparationTime: 5,
        ingredients: ['Chocolate belga', 'Leite condensado', 'Manteiga'],
      },
      {
        restaurant: restaurants[3]._id,
        name: 'Torta de Chocolate',
        description: 'Torta de chocolate com ganache',
        category: 'Tortas',
        price: 28.00,
        available: true,
        preparationTime: 15,
        ingredients: ['Chocolate', 'Creme de leite', 'Biscoito'],
      },
      {
        restaurant: restaurants[3]._id,
        name: 'Cupcake Red Velvet',
        description: 'Cupcake de red velvet com cream cheese',
        category: 'Cupcakes',
        price: 12.00,
        available: true,
        preparationTime: 10,
        ingredients: ['Farinha', 'Cacau', 'Cream cheese', 'Corante'],
      },
      {
        restaurant: restaurants[3]._id,
        name: 'Pudim de Leite',
        description: 'Pudim de leite condensado tradicional',
        category: 'Pudins',
        price: 15.00,
        available: true,
        preparationTime: 8,
        ingredients: ['Leite condensado', 'Leite', 'Ovos', 'Açúcar'],
      },
      {
        restaurant: restaurants[3]._id,
        name: 'Macarons',
        description: 'Macarons franceses com recheios variados',
        category: 'Macarons',
        price: 6.00,
        available: true,
        preparationTime: 5,
        ingredients: ['Amêndoas', 'Açúcar', 'Claras', 'Recheio'],
      },
      {
        restaurant: restaurants[3]._id,
        name: 'Suco Natural',
        description: 'Suco natural de laranja ou limão',
        category: 'Bebidas',
        price: 10.00,
        available: true,
        preparationTime: 5,
      }
    ]);
    
    // Açaí Tropical
    products.push(...[
      {
        restaurant: restaurants[4]._id,
        name: 'Açaí Bowl 500ml',
        description: 'Açaí cremoso com banana, granola e mel',
        category: 'Açaí',
        price: 18.00,
        available: true,
        preparationTime: 10,
        ingredients: ['Açaí', 'Banana', 'Granola', 'Mel'],
      },
      {
        restaurant: restaurants[4]._id,
        name: 'Açaí Bowl 700ml',
        description: 'Açaí cremoso com frutas tropicais',
        category: 'Açaí',
        price: 22.00,
        available: true,
        preparationTime: 10,
        ingredients: ['Açaí', 'Morango', 'Kiwi', 'Granola', 'Leite condensado'],
      },
      {
        restaurant: restaurants[4]._id,
        name: 'Açaí com Whey',
        description: 'Açaí com proteína whey e frutas',
        category: 'Açaí',
        price: 25.00,
        available: true,
        preparationTime: 10,
        ingredients: ['Açaí', 'Whey protein', 'Banana', 'Granola'],
      },
      {
        restaurant: restaurants[4]._id,
        name: 'Vitamina de Açaí',
        description: 'Vitamina de açaí com leite e banana',
        category: 'Vitaminas',
        price: 16.00,
        available: true,
        preparationTime: 8,
        ingredients: ['Açaí', 'Leite', 'Banana', 'Açúcar'],
      },
      {
        restaurant: restaurants[4]._id,
        name: 'Smoothie Verde',
        description: 'Smoothie com couve, banana e gengibre',
        category: 'Smoothies',
        price: 20.00,
        available: true,
        preparationTime: 8,
        ingredients: ['Couve', 'Banana', 'Gengibre', 'Água de coco'],
      },
      {
        restaurant: restaurants[4]._id,
        name: 'Água de Coco',
        description: 'Água de coco natural gelada',
        category: 'Bebidas',
        price: 8.00,
        available: true,
        preparationTime: 3,
      }
    ]);
    
    // Tacos El Mariachi
    products.push(...[
      {
        restaurant: restaurants[5]._id,
        name: 'Tacos de Carne',
        description: 'Tacos com carne temperada e vegetais',
        category: 'Tacos',
        price: 24.00,
        available: true,
        preparationTime: 20,
        ingredients: ['Tortilla', 'Carne', 'Cebola', 'Coentro', 'Molho'],
      },
      {
        restaurant: restaurants[5]._id,
        name: 'Tacos de Frango',
        description: 'Tacos com frango desfiado e guacamole',
        category: 'Tacos',
        price: 22.00,
        available: true,
        preparationTime: 20,
        ingredients: ['Tortilla', 'Frango', 'Guacamole', 'Queijo', 'Sour cream'],
      },
      {
        restaurant: restaurants[5]._id,
        name: 'Burrito Gigante',
        description: 'Burrito recheado com carne, feijão e arroz',
        category: 'Burritos',
        price: 32.00,
        available: true,
        preparationTime: 25,
        ingredients: ['Tortilla grande', 'Carne', 'Feijão', 'Arroz', 'Queijo'],
      },
      {
        restaurant: restaurants[5]._id,
        name: 'Nachos Supreme',
        description: 'Nachos com queijo, jalapeños e guacamole',
        category: 'Entradas',
        price: 28.00,
        available: true,
        preparationTime: 15,
        ingredients: ['Nachos', 'Queijo', 'Jalapeños', 'Guacamole', 'Sour cream'],
      },
      {
        restaurant: restaurants[5]._id,
        name: 'Quesadilla',
        description: 'Quesadilla com queijo e frango',
        category: 'Quesadillas',
        price: 26.00,
        available: true,
        preparationTime: 18,
        ingredients: ['Tortilla', 'Queijo', 'Frango', 'Pimentão'],
      },
      {
        restaurant: restaurants[5]._id,
        name: 'Margarita',
        description: 'Drink tradicional mexicano',
        category: 'Bebidas',
        price: 18.00,
        available: true,
        preparationTime: 5,
        ingredients: ['Tequila', 'Lima', 'Sal', 'Gelo'],
      }
    ]);
    
    // Salada Fresh
    products.push(...[
      {
        restaurant: restaurants[6]._id,
        name: 'Salada Caesar',
        description: 'Salada Caesar com alface, croutons e parmesão',
        category: 'Saladas',
        price: 28.00,
        available: true,
        preparationTime: 15,
        ingredients: ['Alface', 'Croutons', 'Parmesão', 'Molho Caesar'],
      },
      {
        restaurant: restaurants[6]._id,
        name: 'Salada Tropical',
        description: 'Salada com manga, abacate e mix de folhas',
        category: 'Saladas',
        price: 32.00,
        available: true,
        preparationTime: 15,
        ingredients: ['Mix de folhas', 'Manga', 'Abacate', 'Tomate cereja'],
      },
      {
        restaurant: restaurants[6]._id,
        name: 'Bowl Quinoa',
        description: 'Bowl com quinoa, grão-de-bico e vegetais',
        category: 'Bowl',
        price: 35.00,
        available: true,
        preparationTime: 20,
        ingredients: ['Quinoa', 'Grão-de-bico', 'Vegetais', 'Molho tahine'],
      },
      {
        restaurant: restaurants[6]._id,
        name: 'Wrap Vegetariano',
        description: 'Wrap com vegetais frescos e molho especial',
        category: 'Wraps',
        price: 26.00,
        available: true,
        preparationTime: 15,
        ingredients: ['Tortilla integral', 'Vegetais', 'Hummus', 'Rúcula'],
      },
      {
        restaurant: restaurants[6]._id,
        name: 'Suco Detox',
        description: 'Suco verde detox com couve e gengibre',
        category: 'Sucos',
        price: 14.00,
        available: true,
        preparationTime: 8,
        ingredients: ['Couve', 'Gengibre', 'Limão', 'Água de coco'],
      },
      {
        restaurant: restaurants[6]._id,
        name: 'Água Detox',
        description: 'Água saborizada com frutas e ervas',
        category: 'Bebidas',
        price: 8.00,
        available: true,
        preparationTime: 3,
      }
    ]);
    
    // Sorvete Artesanal
    products.push(...[
      {
        restaurant: restaurants[7]._id,
        name: 'Sorvete de Chocolate',
        description: 'Sorvete artesanal de chocolate belga',
        category: 'Sorvetes',
        price: 12.00,
        available: true,
        preparationTime: 5,
        ingredients: ['Chocolate belga', 'Leite', 'Creme de leite'],
      },
      {
        restaurant: restaurants[7]._id,
        name: 'Sorvete de Baunilha',
        description: 'Sorvete cremoso de baunilha natural',
        category: 'Sorvetes',
        price: 10.00,
        available: true,
        preparationTime: 5,
        ingredients: ['Baunilha natural', 'Leite', 'Ovos'],
      },
      {
        restaurant: restaurants[7]._id,
        name: 'Sorvete de Morango',
        description: 'Sorvete com morangos frescos',
        category: 'Sorvetes',
        price: 11.00,
        available: true,
        preparationTime: 5,
        ingredients: ['Morangos frescos', 'Leite', 'Açúcar'],
      },
      {
        restaurant: restaurants[7]._id,
        name: 'Açaí Bowl',
        description: 'Bowl de açaí com frutas e granola',
        category: 'Açaí',
        price: 18.00,
        available: true,
        preparationTime: 8,
        ingredients: ['Açaí', 'Frutas', 'Granola', 'Mel'],
      },
      {
        restaurant: restaurants[7]._id,
        name: 'Milkshake Chocolate',
        description: 'Milkshake cremoso de chocolate',
        category: 'Milkshakes',
        price: 16.00,
        available: true,
        preparationTime: 8,
        ingredients: ['Sorvete chocolate', 'Leite', 'Calda chocolate'],
      },
      {
        restaurant: restaurants[7]._id,
        name: 'Refrigerante 350ml',
        description: 'Coca-Cola, Sprite ou Fanta',
        category: 'Bebidas',
        price: 6.00,
        available: true,
        preparationTime: 2,
      }
    ]);
    
    // Kebab Express
    products.push(...[
      {
        restaurant: restaurants[8]._id,
        name: 'Kebab de Carne',
        description: 'Kebab com carne de cordeiro temperada',
        category: 'Kebab',
        price: 28.00,
        available: true,
        preparationTime: 20,
        ingredients: ['Carne cordeiro', 'Pão árabe', 'Vegetais', 'Molho'],
      },
      {
        restaurant: restaurants[8]._id,
        name: 'Kebab de Frango',
        description: 'Kebab com frango marinado',
        category: 'Kebab',
        price: 26.00,
        available: true,
        preparationTime: 20,
        ingredients: ['Frango marinado', 'Pão árabe', 'Vegetais', 'Iogurte'],
      },
      {
        restaurant: restaurants[8]._id,
        name: 'Shawarma',
        description: 'Shawarma tradicional com carne e vegetais',
        category: 'Shawarma',
        price: 32.00,
        available: true,
        preparationTime: 25,
        ingredients: ['Carne', 'Pão sírio', 'Vegetais', 'Molho especial'],
      },
      {
        restaurant: restaurants[8]._id,
        name: 'Falafel',
        description: 'Falafel com homus e vegetais',
        category: 'Vegetariano',
        price: 24.00,
        available: true,
        preparationTime: 18,
        ingredients: ['Falafel', 'Homus', 'Vegetais', 'Pão árabe'],
      },
      {
        restaurant: restaurants[8]._id,
        name: 'Tabule',
        description: 'Salada árabe com trigo, tomate e salsa',
        category: 'Saladas',
        price: 18.00,
        available: true,
        preparationTime: 15,
        ingredients: ['Trigo', 'Tomate', 'Salsa', 'Limão', 'Azeite'],
      },
      {
        restaurant: restaurants[8]._id,
        name: 'Chá de Menta',
        description: 'Chá tradicional de menta',
        category: 'Bebidas',
        price: 8.00,
        available: true,
        preparationTime: 5,
      }
    ]);
    
    // Café Gourmet
    products.push(...[
      {
        restaurant: restaurants[9]._id,
        name: 'Cappuccino',
        description: 'Cappuccino com leite vaporizado',
        category: 'Cafés',
        price: 12.00,
        available: true,
        preparationTime: 8,
        ingredients: ['Café espresso', 'Leite', 'Canela'],
      },
      {
        restaurant: restaurants[9]._id,
        name: 'Latte Macchiato',
        description: 'Latte macchiato com arte no leite',
        category: 'Cafés',
        price: 14.00,
        available: true,
        preparationTime: 10,
        ingredients: ['Café espresso', 'Leite', 'Espuma'],
      },
      {
        restaurant: restaurants[9]._id,
        name: 'Sanduíche Club',
        description: 'Sanduíche com frango, bacon e vegetais',
        category: 'Sanduíches',
        price: 22.00,
        available: true,
        preparationTime: 15,
        ingredients: ['Pão', 'Frango', 'Bacon', 'Alface', 'Tomate'],
      },
      {
        restaurant: restaurants[9]._id,
        name: 'Croissant de Presunto',
        description: 'Croissant recheado com presunto e queijo',
        category: 'Lanches',
        price: 18.00,
        available: true,
        preparationTime: 10,
        ingredients: ['Croissant', 'Presunto', 'Queijo', 'Manteiga'],
      },
      {
        restaurant: restaurants[9]._id,
        name: 'Bolo de Chocolate',
        description: 'Fatia de bolo de chocolate caseiro',
        category: 'Bolos',
        price: 15.00,
        available: true,
        preparationTime: 5,
        ingredients: ['Chocolate', 'Farinha', 'Ovos', 'Açúcar'],
      },
      {
        restaurant: restaurants[9]._id,
        name: 'Suco Natural',
        description: 'Suco natural de laranja ou limão',
        category: 'Bebidas',
        price: 10.00,
        available: true,
        preparationTime: 5,
      }
    ]);
    
    // Inserir todos os produtos
    await Product.insertMany(products);
    
    console.log('✅ Produtos criados');
    console.log('🎉 Banco de dados populado com sucesso!');
    console.log('');
    console.log('📊 Resumo:');
    console.log(`  - ${restaurantUsers.length} usuários restaurantes`);
    console.log(`  - ${restaurants.length} restaurantes`);
    console.log(`  - ${products.length} produtos`);
    console.log('');
    console.log('🏪 Restaurantes adicionados:');
    restaurants.forEach((restaurant, index) => {
      console.log(`  ${index + 1}. ${restaurant.name} - ${restaurant.category.join(', ')}`);
    });
    console.log('');
    console.log('Acesse: http://localhost:3000/restaurants');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
