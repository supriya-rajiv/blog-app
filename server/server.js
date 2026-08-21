const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Connect to MongoDB
const uri = 'mongodb+srv://supriyarajiv71208_db_user:ENj8FFPGj5Y5lX9D@cluster0.k9plor5.mongodb.net/?appName=Cluster0';
const client = new MongoClient(uri);

let usersCollection;
let blogsCollection;

async function connectDB() {
  await client.connect();
  const db = client.db('blogApp'); // creates a database named "blogApp"
  usersCollection = db.collection('users');
  blogsCollection = db.collection('blogs');
  console.log('Connected to MongoDB!');
}

app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// REGISTER endpoint
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered.' });
  }

  await usersCollection.insertOne({ name, email, password, createdAt: new Date() });

  res.status(201).json({ message: 'Registration successful!' });
});

// LOGIN endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await usersCollection.findOne({ email, password });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  res.status(200).json({ message: 'Login successful!', name: user.name });
});

// CREATE BLOG endpoint
app.post('/api/blogs', async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  const result = await blogsCollection.insertOne({ title, content, createdAt: new Date() });

  res.status(201).json({ message: 'Blog published successfully!', blogId: result.insertedId });
});

// GET ALL BLOGS endpoint
app.get('/api/blogs', async (req, res) => {
  const blogs = await blogsCollection.find().sort({ createdAt: -1 }).toArray();
  res.status(200).json(blogs);
});

// GET SINGLE BLOG (view individual blog details)
app.get('/api/blogs/:id', async (req, res) => {
  const { ObjectId } = require('mongodb');
  try {
    const blog = await blogsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });
    res.status(200).json(blog);
  } catch (err) {
    res.status(400).json({ message: 'Invalid blog ID.' });
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});