const mongoose = require('mongoose');
const Stop = require('./models/Stop');
require('dotenv').config();

async function updateMetroInterchanges() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aictsl-dev');

  console.log('Connected to DB. Updating metro interchanges...');

  // Set default
  await Stop.updateMany({}, { $set: { isMetroInterchange: false } });

  // Update specific stops
  const stopsToUpdate = ['Bhawarkuan Square', 'Radisson Square', 'Palasia Square', 'AICTSL Office'];
  for (const name of stopsToUpdate) {
    await Stop.updateMany({ name: { $regex: name, $options: 'i' } }, { $set: { isMetroInterchange: true } });
  }

  console.log('Update complete.');
  mongoose.disconnect();
}

updateMetroInterchanges();
