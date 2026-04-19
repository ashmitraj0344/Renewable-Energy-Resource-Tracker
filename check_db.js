const mongoose = require('mongoose');
async function run() {
  await mongoose.connect('mongodb://localhost:27017/renewable_energy');
  const collections = await mongoose.connection.db.collections();
  for (let cl of collections) {
    const count = await cl.countDocuments();
    console.log(`${cl.collectionName}: ${count} documents`);
  }
  process.exit(0);
}
run().catch(console.error);
