#!/bin/bash

# Script para configurar o ambiente de desenvolvimento mobile

echo "🚀 Configurando ambiente de desenvolvimento DOOF Mobile..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Verificar se o backend está rodando
if ! docker-compose ps | grep -q "doof-backend.*Up"; then
    echo "📦 Iniciando backend e MongoDB..."
    cd ..
    docker-compose up -d backend mongodb
    cd mobile
    echo "✅ Backend iniciado!"
else
    echo "✅ Backend já está rodando"
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo "✅ Dependências instaladas!"
else
    echo "✅ Dependências já instaladas"
fi

echo ""
echo "🎉 Ambiente configurado com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. Certifique-se de que o Android Studio está aberto"
echo "2. Inicie um AVD (Android Virtual Device)"
echo "3. Execute: npm start"
echo "4. No terminal do Expo, pressione 'a' para abrir no Android"
echo ""
echo "📱 A API está configurada para usar: http://10.0.2.2:5000/api"
echo "   (10.0.2.2 é o alias do emulador Android para localhost do host)"
echo ""

