cp production.json juno.json
cp envProd.txt .env
npm i
npm run build
juno deploy