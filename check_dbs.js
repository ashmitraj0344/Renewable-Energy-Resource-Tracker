const mongoose = require('mongoose');
async function run() {
  await mongoose.connect('mongodb://localhost:27017');
  const admin = mongoose.connection.db.admin();
  const dbs = await admin.listDatabases();
  console.log(JSON.stringify(dbs.databases, null, 2));
  process.exit(0);
}
run().catch(console.error);
