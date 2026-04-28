require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await mongoose.connection
    .collection('questionpapers')
    .updateMany(
      {},
      { $set: { examType: 'insem' } }
    );
  
  console.log('Updated papers:', result.modifiedCount);
  process.exit();
});