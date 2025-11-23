// Script para adicionar 5 produtos para cada restaurante
const mongoose = require('mongoose');

// Conectar ao MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/doof';
mongoose.connect(mongoUri)
  .then(async () => {
    console.log('✅ Conectado ao MongoDB');
    
    // Models
    const Restaurant = mongoose.model('Restaurant', require('./dist/models/Restaurant').default.schema);
    const Product = mongoose.model('Product', require('./dist/models/Product').default.schema);
    
    // Buscar todos os restaurantes
    const restaurants = await Restaurant.find({ isActive: true });
    console.log(`📊 Encontrados ${restaurants.length} restaurantes`);
    
    if (restaurants.length === 0) {
      console.log('❌ Nenhum restaurante encontrado. Execute primeiro o seed de restaurantes.');
      process.exit(1);
    }
    
    // Função para gerar produtos baseados na categoria do restaurante
    const getProductsByCategory = (restaurantName, categories) => {
      const category = categories[0] || 'Geral';
      
      // Produtos por categoria
      const productsByCategory = {
        'Pizza': [
          { name: 'Pizza Margherita', description: 'Molho de tomate, mussarela, manjericão fresco', price: 35.00, category: 'Pizza', preparationTime: 25 },
          { name: 'Pizza Calabresa', description: 'Molho de tomate, mussarela, calabresa, cebola', price: 38.00, category: 'Pizza', preparationTime: 25 },
          { name: 'Pizza 4 Queijos', description: 'Mussarela, provolone, parmesão, gorgonzola', price: 42.00, category: 'Pizza', preparationTime: 25 },
          { name: 'Pizza Portuguesa', description: 'Mussarela, presunto, ovos, cebola, azeitona', price: 40.00, category: 'Pizza', preparationTime: 25 },
          { name: 'Pizza Frango com Catupiry', description: 'Frango desfiado, catupiry, milho', price: 39.00, category: 'Pizza', preparationTime: 25 },
        ],
        'Hambúrguer': [
          { name: 'Burger Classic', description: 'Pão, hambúrguer 180g, queijo, alface, tomate, cebola', price: 25.00, category: 'Hambúrguer', preparationTime: 20 },
          { name: 'Burger Bacon', description: 'Pão, hambúrguer 180g, queijo, bacon crocante, cebola crispy', price: 30.00, category: 'Hambúrguer', preparationTime: 20 },
          { name: 'Burger Duplo', description: 'Pão, 2 hambúrgueres 180g, queijo duplo, picles, molho especial', price: 35.00, category: 'Hambúrguer', preparationTime: 25 },
          { name: 'Burger Chicken', description: 'Pão, filé de frango empanado, queijo, alface, tomate, maionese', price: 28.00, category: 'Hambúrguer', preparationTime: 20 },
          { name: 'Batata Frita Grande', description: 'Porção generosa de batatas crocantes', price: 15.00, category: 'Acompanhamentos', preparationTime: 10 },
        ],
        'Japonês': [
          { name: 'Sushi Combo 10 peças', description: '5 sushis variados e 5 sashimis', price: 45.00, category: 'Japonês', preparationTime: 30 },
          { name: 'Temaki de Salmão', description: 'Salmão fresco, arroz, alga nori, cream cheese', price: 22.00, category: 'Japonês', preparationTime: 15 },
          { name: 'Hot Roll 8 unidades', description: 'Rolinho empanado com salmão e cream cheese', price: 35.00, category: 'Japonês', preparationTime: 20 },
          { name: 'Sashimi de Salmão', description: '5 fatias de salmão fresco', price: 38.00, category: 'Japonês', preparationTime: 15 },
          { name: 'Yakisoba', description: 'Macarrão com legumes, carne e molho especial', price: 32.00, category: 'Japonês', preparationTime: 25 },
        ],
        'Italiana': [
          { name: 'Spaghetti Carbonara', description: 'Massa com bacon, ovos, queijo parmesão', price: 38.00, category: 'Massa', preparationTime: 20 },
          { name: 'Lasanha à Bolonhesa', description: 'Camadas de massa, molho bolonhesa, queijo', price: 42.00, category: 'Massa', preparationTime: 30 },
          { name: 'Penne ao Pesto', description: 'Massa penne com molho pesto e queijo', price: 35.00, category: 'Massa', preparationTime: 18 },
          { name: 'Risotto de Camarão', description: 'Arroz cremoso com camarões e ervas', price: 48.00, category: 'Massa', preparationTime: 25 },
          { name: 'Ravioli 4 Queijos', description: 'Massa recheada com 4 queijos, molho de tomate', price: 40.00, category: 'Massa', preparationTime: 22 },
        ],
        'Churrasco': [
          { name: 'Picanha Grelhada', description: '300g de picanha grelhada, acompanha arroz e farofa', price: 55.00, category: 'Carnes', preparationTime: 30 },
          { name: 'Costela de Boi', description: 'Costela assada na brasa, acompanha batata frita', price: 48.00, category: 'Carnes', preparationTime: 35 },
          { name: 'Alcatra com Fritas', description: '300g de alcatra, batata frita e salada', price: 45.00, category: 'Carnes', preparationTime: 25 },
          { name: 'Espetinho Misto', description: '3 espetinhos: carne, frango e linguiça', price: 32.00, category: 'Carnes', preparationTime: 20 },
          { name: 'Picanha na Chapa', description: '200g de picanha na chapa, arroz e feijão', price: 42.00, category: 'Carnes', preparationTime: 25 },
        ],
        'Mexicana': [
          { name: 'Taco de Carne', description: '3 tacos com carne moída, queijo, alface e tomate', price: 28.00, category: 'Mexicana', preparationTime: 15 },
          { name: 'Burrito de Frango', description: 'Tortilla com frango, feijão, queijo e guacamole', price: 32.00, category: 'Mexicana', preparationTime: 18 },
          { name: 'Quesadilla', description: 'Tortilla recheada com queijo e frango', price: 25.00, category: 'Mexicana', preparationTime: 12 },
          { name: 'Nachos com Queijo', description: 'Tortilhas crocantes com queijo derretido e jalapeños', price: 22.00, category: 'Mexicana', preparationTime: 10 },
          { name: 'Chili con Carne', description: 'Carne moída com feijão, pimenta e queijo', price: 35.00, category: 'Mexicana', preparationTime: 20 },
        ],
        'Árabe': [
          { name: 'Kebab de Carne', description: 'Carne grelhada, salada, molho especial no pão árabe', price: 28.00, category: 'Árabe', preparationTime: 15 },
          { name: 'Esfiha de Carne', description: '3 esfihas de carne temperada', price: 18.00, category: 'Árabe', preparationTime: 10 },
          { name: 'Shawarma de Frango', description: 'Frango grelhado, salada, tahine no pão sírio', price: 26.00, category: 'Árabe', preparationTime: 15 },
          { name: 'Quibe Assado', description: 'Quibe tradicional com carne e trigo', price: 22.00, category: 'Árabe', preparationTime: 20 },
          { name: 'Hummus com Pão', description: 'Pasta de grão-de-bico com azeite e pão árabe', price: 20.00, category: 'Árabe', preparationTime: 8 },
        ],
        'Saudável': [
          { name: 'Salada Caesar', description: 'Alface, frango grelhado, croutons, molho caesar', price: 32.00, category: 'Saladas', preparationTime: 15 },
          { name: 'Salada Tropical', description: 'Mix de folhas, manga, abacate, frango e molho especial', price: 35.00, category: 'Saladas', preparationTime: 15 },
          { name: 'Wrap Vegetariano', description: 'Tortilla com vegetais grelhados e molho', price: 28.00, category: 'Vegetariano', preparationTime: 12 },
          { name: 'Bowl de Quinoa', description: 'Quinoa, vegetais, grão-de-bico e molho tahine', price: 30.00, category: 'Vegetariano', preparationTime: 18 },
          { name: 'Suco Detox', description: 'Suco verde com couve, abacaxi, gengibre e limão', price: 12.00, category: 'Bebidas', preparationTime: 5 },
        ],
        'Açaí': [
          { name: 'Açaí 500ml', description: 'Açaí cremoso com banana, granola e mel', price: 18.00, category: 'Açaí', preparationTime: 8 },
          { name: 'Açaí 700ml', description: 'Açaí cremoso com frutas, granola, leite condensado', price: 22.00, category: 'Açaí', preparationTime: 8 },
          { name: 'Açaí Bowl Completo', description: 'Açaí, banana, morango, granola, mel, leite condensado', price: 25.00, category: 'Açaí', preparationTime: 10 },
          { name: 'Açaí com Nutella', description: 'Açaí cremoso com Nutella e morangos', price: 24.00, category: 'Açaí', preparationTime: 8 },
          { name: 'Smoothie de Açaí', description: 'Açaí batido com banana e leite', price: 16.00, category: 'Açaí', preparationTime: 6 },
        ],
        'Sorvete': [
          { name: 'Sorvete de Chocolate', description: '2 bolas de sorvete de chocolate artesanal', price: 15.00, category: 'Sorvete', preparationTime: 5 },
          { name: 'Sorvete de Morango', description: '2 bolas de sorvete de morango artesanal', price: 15.00, category: 'Sorvete', preparationTime: 5 },
          { name: 'Açaí na Casquinha', description: 'Açaí cremoso na casquinha com cobertura', price: 12.00, category: 'Sorvete', preparationTime: 5 },
          { name: 'Milkshake de Chocolate', description: 'Milkshake cremoso com sorvete e calda', price: 18.00, category: 'Sorvete', preparationTime: 8 },
          { name: 'Sundae Especial', description: 'Sorvete com calda, chantilly, morangos e castanhas', price: 22.00, category: 'Sorvete', preparationTime: 10 },
        ],
        'Café': [
          { name: 'Cappuccino', description: 'Café expresso com leite vaporizado e espuma', price: 12.00, category: 'Café', preparationTime: 5 },
          { name: 'Latte Macchiato', description: 'Leite vaporizado com shot de café expresso', price: 14.00, category: 'Café', preparationTime: 5 },
          { name: 'Croissant de Presunto e Queijo', description: 'Croissant recheado com presunto e queijo', price: 18.00, category: 'Lanches', preparationTime: 8 },
          { name: 'Brigadeiro Gourmet', description: 'Brigadeiro artesanal com chocolate belga', price: 8.00, category: 'Doces', preparationTime: 3 },
          { name: 'Sanduíche Natural', description: 'Pão integral, peito de peru, queijo, alface e tomate', price: 22.00, category: 'Lanches', preparationTime: 10 },
        ],
        'Padaria': [
          { name: 'Pão de Açúcar', description: 'Pão doce tradicional', price: 4.00, category: 'Padaria', preparationTime: 3 },
          { name: 'Coxinha de Frango', description: 'Coxinha crocante recheada com frango', price: 6.00, category: 'Salgados', preparationTime: 5 },
          { name: 'Pastel de Carne', description: 'Pastel frito recheado com carne moída', price: 7.00, category: 'Salgados', preparationTime: 5 },
          { name: 'Bolo de Chocolate', description: 'Fatia de bolo de chocolate caseiro', price: 10.00, category: 'Doces', preparationTime: 3 },
          { name: 'Pão de Queijo', description: '5 unidades de pão de queijo mineiro', price: 12.00, category: 'Padaria', preparationTime: 5 },
        ],
        'Frutos do Mar': [
          { name: 'Moqueca de Camarão', description: 'Camarões na moqueca com dendê e leite de coco', price: 58.00, category: 'Frutos do Mar', preparationTime: 30 },
          { name: 'Peixe Grelhado', description: 'Filé de peixe grelhado com legumes', price: 45.00, category: 'Peixe', preparationTime: 25 },
          { name: 'Camarão à Milanesa', description: 'Camarões empanados com arroz e batata frita', price: 52.00, category: 'Camarão', preparationTime: 28 },
          { name: 'Risotto de Camarão', description: 'Arroz cremoso com camarões e ervas', price: 48.00, category: 'Frutos do Mar', preparationTime: 25 },
          { name: 'Salmão Grelhado', description: 'Filé de salmão grelhado com legumes e molho', price: 55.00, category: 'Peixe', preparationTime: 25 },
        ],
        'Oriental': [
          { name: 'Yakisoba de Carne', description: 'Macarrão com carne, legumes e molho especial', price: 32.00, category: 'Oriental', preparationTime: 20 },
          { name: 'Frango Xadrez', description: 'Frango com legumes, castanhas e molho agridoce', price: 35.00, category: 'Oriental', preparationTime: 22 },
          { name: 'Rolinho Primavera', description: '4 unidades de rolinho primavera frito', price: 18.00, category: 'Oriental', preparationTime: 15 },
          { name: 'Pad Thai', description: 'Macarrão tailandês com camarão e legumes', price: 38.00, category: 'Oriental', preparationTime: 25 },
          { name: 'Frango à Parmegiana', description: 'Filé de frango empanado com molho e queijo', price: 40.00, category: 'Oriental', preparationTime: 25 },
        ],
        'Petiscos': [
          { name: 'Batata Frita com Cheddar', description: 'Batata frita com cheddar e bacon', price: 28.00, category: 'Porções', preparationTime: 15 },
          { name: 'Isca de Peixe', description: 'Iscas de peixe empanadas com molho tártaro', price: 32.00, category: 'Porções', preparationTime: 20 },
          { name: 'Coxinha de Frango', description: '10 unidades de coxinha de frango', price: 35.00, category: 'Petiscos', preparationTime: 18 },
          { name: 'Torresmo', description: 'Porção de torresmo crocante', price: 25.00, category: 'Petiscos', preparationTime: 15 },
          { name: 'Mandioca Frita', description: 'Porção de mandioca frita com molho', price: 20.00, category: 'Porções', preparationTime: 12 },
        ],
        'Doces': [
          { name: 'Brigadeiro Gourmet', description: '6 unidades de brigadeiro artesanal', price: 25.00, category: 'Doces', preparationTime: 5 },
          { name: 'Brownie com Sorvete', description: 'Brownie quente com sorvete de creme', price: 22.00, category: 'Sobremesas', preparationTime: 8 },
          { name: 'Torta de Limão', description: 'Fatia de torta de limão caseira', price: 18.00, category: 'Doces', preparationTime: 5 },
          { name: 'Pudim de Leite', description: 'Pudim de leite condensado com calda', price: 15.00, category: 'Sobremesas', preparationTime: 5 },
          { name: 'Beijinho', description: '6 unidades de beijinho artesanal', price: 20.00, category: 'Doces', preparationTime: 5 },
        ],
        'Salgados': [
          { name: 'Coxinha de Frango', description: 'Coxinha crocante recheada com frango', price: 6.00, category: 'Salgados', preparationTime: 5 },
          { name: 'Pastel de Carne', description: 'Pastel frito recheado com carne moída', price: 7.00, category: 'Salgados', preparationTime: 5 },
          { name: 'Esfiha de Carne', description: 'Esfiha de carne temperada', price: 5.00, category: 'Salgados', preparationTime: 5 },
          { name: 'Kibe Frito', description: 'Kibe frito recheado com carne', price: 6.00, category: 'Salgados', preparationTime: 5 },
          { name: 'Enroladinho de Salsicha', description: 'Massa crocante com salsicha', price: 5.00, category: 'Salgados', preparationTime: 5 },
        ],
        'Sucos': [
          { name: 'Suco de Laranja', description: 'Suco natural de laranja 500ml', price: 10.00, category: 'Bebidas', preparationTime: 5 },
          { name: 'Suco de Maracujá', description: 'Suco natural de maracujá 500ml', price: 10.00, category: 'Bebidas', preparationTime: 5 },
          { name: 'Suco Detox', description: 'Suco verde com couve, abacaxi e gengibre', price: 12.00, category: 'Bebidas', preparationTime: 5 },
          { name: 'Vitamina de Banana', description: 'Vitamina de banana com leite e aveia', price: 11.00, category: 'Bebidas', preparationTime: 5 },
          { name: 'Água de Coco', description: 'Água de coco natural 500ml', price: 8.00, category: 'Bebidas', preparationTime: 3 },
        ],
        'Tapioca': [
          { name: 'Tapioca de Queijo', description: 'Tapioca com queijo coalho', price: 12.00, category: 'Tapioca', preparationTime: 8 },
          { name: 'Tapioca de Frango', description: 'Tapioca com frango desfiado e queijo', price: 15.00, category: 'Tapioca', preparationTime: 10 },
          { name: 'Tapioca Doce de Coco', description: 'Tapioca com coco e leite condensado', price: 10.00, category: 'Tapioca', preparationTime: 8 },
          { name: 'Tapioca de Banana e Canela', description: 'Tapioca com banana e canela', price: 11.00, category: 'Tapioca', preparationTime: 8 },
          { name: 'Tapioca de Carne Seca', description: 'Tapioca com carne seca e queijo', price: 18.00, category: 'Tapioca', preparationTime: 12 },
        ],
      };
      
      // Tentar encontrar produtos pela categoria principal
      let products = productsByCategory[category];
      
      // Se não encontrar, tentar outras categorias
      if (!products) {
        for (const cat of categories) {
          if (productsByCategory[cat]) {
            products = productsByCategory[cat];
            break;
          }
        }
      }
      
      // Se ainda não encontrar, usar produtos genéricos
      if (!products) {
        products = [
          { name: `${restaurantName} - Prato 1`, description: 'Descrição do prato 1', price: 30.00, category: category, preparationTime: 20 },
          { name: `${restaurantName} - Prato 2`, description: 'Descrição do prato 2', price: 35.00, category: category, preparationTime: 25 },
          { name: `${restaurantName} - Prato 3`, description: 'Descrição do prato 3', price: 28.00, category: category, preparationTime: 18 },
          { name: `${restaurantName} - Prato 4`, description: 'Descrição do prato 4', price: 32.00, category: category, preparationTime: 22 },
          { name: `${restaurantName} - Prato 5`, description: 'Descrição do prato 5', price: 26.00, category: category, preparationTime: 15 },
        ];
      }
      
      return products;
    };
    
    let totalProducts = 0;
    let productsCreated = 0;
    let productsSkipped = 0;
    
    // Para cada restaurante, criar 5 produtos
    for (const restaurant of restaurants) {
      // Verificar se já existem produtos para este restaurante
      const existingProducts = await Product.countDocuments({ restaurant: restaurant._id });
      
      if (existingProducts >= 5) {
        console.log(`⏭️  ${restaurant.name}: Já possui ${existingProducts} produtos (pulando)`);
        productsSkipped += existingProducts;
        continue;
      }
      
      // Quantos produtos precisam ser criados
      const productsToCreate = 5 - existingProducts;
      
      // Obter produtos baseados na categoria
      const productsData = getProductsByCategory(restaurant.name, restaurant.category);
      
      // Criar apenas os produtos necessários
      const productsToAdd = productsData.slice(0, productsToCreate).map(product => ({
        ...product,
        restaurant: restaurant._id,
        available: true,
      }));
      
      try {
        await Product.insertMany(productsToAdd);
        productsCreated += productsToAdd.length;
        totalProducts += await Product.countDocuments({ restaurant: restaurant._id });
        console.log(`✅ ${restaurant.name}: ${productsToAdd.length} produto(s) criado(s) (total: ${await Product.countDocuments({ restaurant: restaurant._id })})`);
      } catch (error) {
        console.error(`❌ Erro ao criar produtos para ${restaurant.name}:`, error.message);
      }
    }
    
    console.log('');
    console.log('🎉 Produtos adicionados com sucesso!');
    console.log('');
    console.log('📊 Resumo:');
    console.log(`  - Restaurantes processados: ${restaurants.length}`);
    console.log(`  - Produtos criados: ${productsCreated}`);
    console.log(`  - Produtos já existentes (pulados): ${productsSkipped}`);
    console.log(`  - Total de produtos no banco: ${await Product.countDocuments()}`);
    console.log('');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });




