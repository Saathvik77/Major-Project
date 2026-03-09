const mongoose = require('mongoose');

const uri = 'mongodb://admin:admin123@ac-ehxf2hl-shard-00-00.gqprxfg.mongodb.net:27017,ac-ehxf2hl-shard-00-01.gqprxfg.mongodb.net:27017,ac-ehxf2hl-shard-00-02.gqprxfg.mongodb.net:27017/?ssl=true&replicaSet=atlas-c7gyt3-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(uri)
  .then(async () => {
    try {
      const db = mongoose.connection.db;
      const users = await db.collection('users').find({}).project({email: 1, phno: 1, name: 1}).toArray();
      console.log('--- USER PHONE NUMBERS ---');
      console.log(JSON.stringify(users, null, 2));
    } catch (err) {
      console.error(err);
    } finally {
      process.exit(0);
    }
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
