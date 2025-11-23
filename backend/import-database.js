const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/doof';
const BACKUP_DIR = path.join(__dirname, 'database-backup');

async function importDatabase(backupFile = 'doof-backup-latest.json') {
  const client = new MongoClient(MONGODB_URI);

  try {
    // Verificar se o arquivo existe
    const filepath = path.join(BACKUP_DIR, backupFile);
    if (!fs.existsSync(filepath)) {
      console.error(`❌ Arquivo de backup não encontrado: ${filepath}`);
      console.log('\nArquivos disponíveis:');
      if (fs.existsSync(BACKUP_DIR)) {
        const files = fs.readdirSync(BACKUP_DIR);
        files.forEach(file => console.log(`  - ${file}`));
      }
      process.exit(1);
    }

    console.log(`📂 Carregando backup: ${filepath}`);
    const backupData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    console.log(`📅 Data do backup: ${backupData.exportDate}`);
    console.log(`🗄️  Banco de dados: ${backupData.database}`);
    console.log(`📦 Coleções: ${Object.keys(backupData.collections).length}\n`);

    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db('doof');

    // Importar cada coleção
    for (const [collectionName, documents] of Object.entries(backupData.collections)) {
      console.log(`📦 Importando coleção: ${collectionName}`);
      
      const collection = db.collection(collectionName);
      
      // Limpar coleção existente (opcional - comentar se quiser manter dados existentes)
      const existingCount = await collection.countDocuments();
      if (existingCount > 0) {
        console.log(`   ⚠️  Coleção já possui ${existingCount} documentos. Limpando...`);
        await collection.deleteMany({});
      }
      
      // Inserir documentos
      if (documents.length > 0) {
        await collection.insertMany(documents);
        console.log(`   ✅ ${documents.length} documentos importados`);
      } else {
        console.log(`   ℹ️  Nenhum documento para importar`);
      }
    }

    console.log('\n✅ Importação concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao importar banco de dados:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ Conexão fechada');
  }
}

// Pegar nome do arquivo dos argumentos da linha de comando
const backupFile = process.argv[2] || 'doof-backup-latest.json';
importDatabase(backupFile);




