const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const ejs = require('ejs');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views')); // Use path.join for cross-platform compatibility

// MONGO DB CONNECTION
// Connection URI - Replace with your MongoDB connection URI
const uri = process.env.MONGODB_URI || 'mongodb+srv://amuinharniel:iOAFA6o9vAFL1Ddt@blog.vi6xnkk.mongodb.net/?retryWrites=true&w=majority&appName=Blog'; // Use environment variable or local MongoDB URI

// Database Name
const dbName = 'portal';

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB outside of route handler
(async () => {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB server');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
})();

// Connect to the database
const db = client.db(dbName);
const collection = db.collection('enrollment-portal');

// MONGO DB CONNECTION

// Define a route for the root URL '/'
app.get('/', (req, res) => {
  // Use path module to construct the absolute path to your HTML file
  const htmlPath = path.join(__dirname, '../views', 'index.html');
  // Send the HTML file as the response
  res.sendFile(htmlPath);
});

app.get('/responses', async (req, res) => {
  // Find all documents in the collection
  const cursor = collection.find();
  // Convert the cursor to an array of documents
  const data = await cursor.toArray();
  // Display all data from the database
  res.render('template', { data }); // Render the template with the received data
})

app.get('/delete', async (req, res) => {
  const { id } = req.query; // Assuming you receive the document ID from the query parameter
  console.log(id)
  try {
    const result = await db.collection('enrollment-portal').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.redirect('/responses'); // Redirect to the responses page after deletion
    } else {
      res.status(404).send('Document not found'); // Respond with an error message if the document is not found
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).send('Internal Server Error'); // Respond with an error message
  }
});

app.post('/upload', async (req, res) => {
  const details = req.body; // No need for await here

  try {
    await collection.insertOne(details);
    // Find all documents in the collection
    const cursor = collection.find();
    // Convert the cursor to an array of documents
    const data = await cursor.toArray();
    // Display all data from the database
    res.render('template', { data }); // Render the template with the received data
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).send('Internal Server Error'); // Respond with an error message
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
