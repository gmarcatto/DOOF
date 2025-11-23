const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/doof';
const BACKUP_FILE = path.join(__dirname, 'database-backup.json');

async function restoreDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    // Verificar se o arquivo existe
    if (!fs.existsSync(BACKUP_FILE)) {
      console.error(`❌ Arquivo de backup não encontrado: ${BACKUP_FILE}`);
      process.exit(1);
    }

    console.log(`📂 Carregando backup: ${BACKUP_FILE}`);
    const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
    
    console.log(`📅 Data do backup: ${backupData.exportDate}`);
    console.log(`📦 Coleções: ${Object.keys(backupData.collections).length}\n`);

    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db('doof');

    // Importar cada coleção
    for (const [collectionName, documents] of Object.entries(backupData.collections)) {
      console.log(`📦 Restaurando: ${collectionName}`);
      
      const collection = db.collection(collectionName);
      
      // Limpar coleção existente
      await collection.deleteMany({});
      
      // Inserir documentos
      if (documents.length > 0) {
        await collection.insertMany(documents);
        console.log(`   ✅ ${documents.length} documentos restaurados`);
      }
    }

    console.log('\n✅ Restauração concluída!');

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

restoreDatabase();




