const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware: lets our server understand JSON sent from the frontend
app.use(express.json());

// Middleware: allows our frontend (running on a different port/file) to talk to this server
app.use(cors());

// File where we'll store users
const USERS_FILE = path.join(__dirname, 'users.json');

// Helper: read users from file
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]');
  }
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

// Helper: save users to file
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Test route - visit this in your browser to confirm server works
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// REGISTER endpoint
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const users = readUsers();

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered.' });
  }

  const newUser = { id: Date.now(), name, email, password };
  users.push(newUser);
  saveUsers(users);

  res.status(201).json({ message: 'Registration successful!' });
});

// LOGIN endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const users = readUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  res.status(200).json({ message: 'Login successful!', name: user.name });
});
// File where we'll store blogs
const BLOGS_FILE = path.join(__dirname, 'blogs.json');

// Helper: read blogs from file
function readBlogs() {
  if (!fs.existsSync(BLOGS_FILE)) {
    fs.writeFileSync(BLOGS_FILE, '[]');
  }
  const data = fs.readFileSync(BLOGS_FILE);
  return JSON.parse(data);
}

// Helper: save blogs to file
function saveBlogs(blogs) {
  fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2));
}

// CREATE BLOG endpoint
app.post('/api/blogs', (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  const blogs = readBlogs();
  const newBlog = { id: Date.now(), title, content, createdAt: new Date().toISOString() };
  blogs.push(newBlog);
  saveBlogs(blogs);

  res.status(201).json({ message: 'Blog published successfully!', blog: newBlog });
});

// GET ALL BLOGS endpoint
app.get('/api/blogs', (req, res) => {
  const blogs = readBlogs();
  res.status(200).json(blogs);
});
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});