const fs = require('fs');
const chokidar = require('chokidar');
const mongoose = require('mongoose');
const Listing = require('./models/listing'); // Import the Mongoose model

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yourDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Path to the JSON file you want to watch
const jsonFilePath = './data.json';

// Watch the JSON file for changes
const watcher = chokidar.watch(jsonFilePath, { persistent: true });

// When a change occurs in the file
watcher.on('change', async (path) => {
  console.log(`File ${path} has been changed. Syncing with MongoDB...`);

  // Read the updated JSON data
  fs.readFile(path, 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    try {
      // Loop through the JSON data and update MongoDB
      for (const listingData of jsonData) {
        // Update or insert the document in MongoDB based on _id
        await Listing.findOneAndUpdate(
          { _id: listingData._id }, // Match by _id
          listingData,               // Update with the new data
          { upsert: true, new: true } // Create if not found, and return the updated document
        );
      }

      console.log('Database updated successfully!');
    } catch (error) {
      console.error('Error updating MongoDB:', error);
    }
  });
});

console.log('Watching for changes in JSON file...');
