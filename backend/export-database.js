const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/doof';
const OUTPUT_DIR = path.join(__dirname, 'database-backup');

async function exportDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db('doof');
    const collections = await db.listCollections().toArray();
    
    // Criar diretório de backup se não existir
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const backupData = {
      exportDate: new Date().toISOString(),
      database: 'doof',
      collections: {}
    };

    // Exportar cada coleção
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`📦 Exportando coleção: ${collectionName}`);
      
      const collection = db.collection(collectionName);
      const documents = await collection.find({}).toArray();
      
      backupData.collections[collectionName] = documents;
      console.log(`   ✅ ${documents.length} documentos exportados`);
    }

    // Salvar em arquivo JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `doof-backup-${timestamp}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2), 'utf8');
    console.log(`\n✅ Backup salvo em: ${filepath}`);
    console.log(`📊 Total de coleções: ${collections.length}`);

    // Também salvar como "latest" para facilitar
    const latestPath = path.join(OUTPUT_DIR, 'doof-backup-latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(backupData, null, 2), 'utf8');
    console.log(`✅ Backup também salvo como: ${latestPath}`);

  } catch (error) {
    console.error('❌ Erro ao exportar banco de dados:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ Conexão fechada');
  }
}

exportDatabase();




