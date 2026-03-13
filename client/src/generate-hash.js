// server/generate-hash.js
const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'admin123';
  // 10 est le "salt rounds" (niveau de sécurité)
  const hash = await bcrypt.hash(password, 10);
  
  console.log('----------------------------------');
  console.log('Mot de passe : admin123');
  console.log('Hash généré  :', hash);
  console.log('----------------------------------');
  console.log('Copiez ce hash dans votre fichier SQL ou votre BDD !');
}

generateHash();