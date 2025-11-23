// Script para corrigir Plus Codes nos placeNames dos restaurantes
const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/doof';
mongoose.connect(mongoUri)
  .then(async () => {
    console.log('✅ Conectado ao MongoDB');
    
    // Models
    const Restaurant = mongoose.model('Restaurant', require('./dist/models/Restaurant').default.schema);
    
    // Importar serviço de geocoding
    const { updateRestaurantPlaceName } = require('./dist/services/geocodingService');
    
    // Função para detectar Plus Code
    const isPlusCode = (str) => {
      if (!str) return false;
      const trimmed = str.trim();
      const plusCodePattern = /^[A-Z0-9]{4,8}\+[A-Z0-9]{2,3}$/i;
      return plusCodePattern.test(trimmed);
    };
    
    // Buscar todos os restaurantes com placeName que seja Plus Code
    const restaurants = await Restaurant.find({
      'address.coordinates.latitude': { $exists: true, $ne: null },
      'address.coordinates.longitude': { $exists: true, $ne: null },
      'address.placeName': { $exists: true, $ne: null }
    });
    
    console.log(`📊 Verificando ${restaurants.length} restaurantes...`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Processar cada restaurante
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      
      try {
        // Verificar se o placeName atual é um Plus Code
        if (restaurant.address.placeName && isPlusCode(restaurant.address.placeName)) {
          console.log(`\n[${i + 1}/${restaurants.length}] Corrigindo: ${restaurant.name}`);
          console.log(`   PlaceName atual (Plus Code): "${restaurant.address.placeName}"`);
          
          // Tentar obter um novo placeName
          const newPlaceName = await updateRestaurantPlaceName(restaurant);
          
          if (newPlaceName && !isPlusCode(newPlaceName)) {
            restaurant.address.placeName = newPlaceName;
            await restaurant.save();
            console.log(`   ✅ Place name atualizado: "${newPlaceName}"`);
            fixedCount++;
          } else {
            // Se não encontrou um nome legível, remover o Plus Code
            restaurant.address.placeName = null;
            await restaurant.save();
            console.log(`   ⚠️  Plus Code removido (será usado endereço formatado)`);
            fixedCount++;
          }
          
          // Aguardar um pouco para não sobrecarregar a API
          if (i < restaurants.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } else {
          skippedCount++;
        }
        
      } catch (error) {
        console.error(`   ❌ Erro ao processar ${restaurant.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Processamento concluído!');
    console.log('');
    console.log('📊 Resumo:');
    console.log(`  - Restaurantes verificados: ${restaurants.length}`);
    console.log(`  - Plus Codes corrigidos: ${fixedCount}`);
    console.log(`  - Sem Plus Code (pulados): ${skippedCount}`);
    console.log(`  - Erros: ${errorCount}`);
    console.log('');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });

