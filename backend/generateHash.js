const bcrypt = require("bcrypt");

async function generateHash() {
  const hash = await bcrypt.hash("admin123", 10);
  console.log(hash);
}

generateHash();
