cp staging.json juno.json
cp envStaging.txt .env
npm i
npm run build
juno deploy