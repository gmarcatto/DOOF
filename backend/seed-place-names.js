// Script para popular placeName dos restaurantes usando reverse geocoding
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
    
    // Buscar todos os restaurantes com coordenadas mas sem placeName
    const restaurants = await Restaurant.find({
      'address.coordinates.latitude': { $exists: true, $ne: null },
      'address.coordinates.longitude': { $exists: true, $ne: null },
      $or: [
        { 'address.placeName': { $exists: false } },
        { 'address.placeName': null },
        { 'address.placeName': '' }
      ]
    });
    
    console.log(`📊 Encontrados ${restaurants.length} restaurantes para atualizar`);
    
    if (restaurants.length === 0) {
      console.log('✅ Todos os restaurantes já possuem placeName');
      process.exit(0);
    }
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    // Processar cada restaurante
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      
      try {
        console.log(`\n[${i + 1}/${restaurants.length}] Processando: ${restaurant.name}`);
        console.log(`   Coordenadas: ${restaurant.address.coordinates.latitude}, ${restaurant.address.coordinates.longitude}`);
        
        // Obter nome do lugar via reverse geocoding
        const placeName = await updateRestaurantPlaceName(restaurant);
        
        if (placeName) {
          // Atualizar restaurante
          restaurant.address.placeName = placeName;
          await restaurant.save();
          
          console.log(`   ✅ Place name atualizado: "${placeName}"`);
          successCount++;
        } else {
          console.log(`   ⚠️  Não foi possível obter place name`);
          skippedCount++;
        }
        
        // Aguardar um pouco para não sobrecarregar a API
        if (i < restaurants.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms entre requisições
        }
        
      } catch (error) {
        console.error(`   ❌ Erro ao processar ${restaurant.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Processamento concluído!');
    console.log('');
    console.log('📊 Resumo:');
    console.log(`  - Restaurantes processados: ${restaurants.length}`);
    console.log(`  - Place names atualizados: ${successCount}`);
    console.log(`  - Não encontrados: ${skippedCount}`);
    console.log(`  - Erros: ${errorCount}`);
    console.log('');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });




