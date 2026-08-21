require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(cors());

// Connect to MongoDB
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let usersCollection;
let blogsCollection;

async function connectDB() {
  await client.connect();
  const db = client.db('blogApp');
  usersCollection = db.collection('users');
  blogsCollection = db.collection('blogs');
  console.log('Connected to MongoDB!');
}

// Middleware: checks if a valid token was sent
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization; // expects "Bearer <token>"

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
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

  const token = jwt.sign({ userId: user._id, name: user.name }, JWT_SECRET, { expiresIn: '2h' });

  res.status(200).json({ message: 'Login successful!', name: user.name, token });
});

// CREATE BLOG endpoint (protected)
app.post('/api/blogs', requireAuth, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  const result = await blogsCollection.insertOne({
    title,
    content,
    userId: req.userId,
    createdAt: new Date()
  });

  res.status(201).json({ message: 'Blog published successfully!', blogId: result.insertedId });
});

// GET ALL BLOGS endpoint
app.get('/api/blogs', async (req, res) => {
  const blogs = await blogsCollection.find().sort({ createdAt: -1 }).toArray();
  res.status(200).json(blogs);
});

// GET SINGLE BLOG (view individual blog details)
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await blogsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });
    res.status(200).json(blog);
  } catch (err) {
    res.status(400).json({ message: 'Invalid blog ID.' });
  }
});

// GET MY BLOGS (for dashboard, protected)
app.get('/api/my-blogs', requireAuth, async (req, res) => {
  const blogs = await blogsCollection
    .find({ userId: new ObjectId(req.userId) })
    .sort({ createdAt: -1 })
    .toArray();

  res.status(200).json(blogs);
});

// UPDATE BLOG endpoint
app.put('/api/blogs/:id', async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  try {
    const result = await blogsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { title, content } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    res.status(200).json({ message: 'Blog updated successfully!' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid blog ID.' });
  }
});

// DELETE BLOG endpoint
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const result = await blogsCollection.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    res.status(200).json({ message: 'Blog deleted successfully!' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid blog ID.' });
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});