
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const axios = require('axios');
const { Server } = require('socket.io');
require('dotenv').config();
const { HfInference } = require('@huggingface/inference'); // Correct import
const hf = new HfInference(process.env.HF_API_KEY); // Correct initialization

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});
// const hf = new HfInference(process.env.HF_API_KEY);
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
const mongoURI = 'mongodb+srv://koarsk03:YMZZWwO6lmDKU0zn@cluster0.zfyqj.mongodb.net/';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
  const documentSchema = new mongoose.Schema(
    {
      title: { type: String, required: true },
      content: { type: String, default: '' },
      version: { type: Number, default: 1 },
      owner: { type: String, required: true },
    },
    { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } } // Enable timestamps
  );
// Define Document schema and model
// const documentSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   content: { type: String, default: '' },
//   version: { type: Number, default: 1 },
//   owner: { type: String, required: true },
// });
// Define Document schema and model
// const documentSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   content: { type: String, default: '' },
//   version: { type: Number, default: 1 },
//   owner: { type: String, required: true },
//   ownerId: { type: String, required: true }, // Track user ID of the creator
//   createdAt: { type: Date, default: Date.now } // Track document creation date
// });

const Document = mongoose.model('Document', documentSchema);

const { v4: uuidv4 } = require('uuid'); // Import uuid library for unique IDs

// Route to create a new document
app.post('/api/documents', async (req, res) => {
  const { title, owner } = req.body;
  if (!title || !owner) {
    return res.status(400).json({ error: 'Title and owner are required' });
  }

  try {
    // Automatically generate a unique ownerId
    const ownerId = uuidv4(); // Generates a unique identifier

    const newDoc = await Document.create({ title, owner});
    io.emit('new_document', newDoc); // Emit event to all clients
    res.json(newDoc);
  } catch (err) {
    console.error('Error creating document:', err);
    res.status(500).send(err);
  }
});


// Route to request permission for a document
app.post('/api/documents/:id/request-permission', async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  try {
    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const owner = doc.owner;
    io.to(owner).emit('permission_request', { documentId: id, username });
    res.json({ message: 'Permission request sent' });
  } catch (err) {
    res.status(500).send(err);
  }
});
const HF_TOKEN = process.env.HF_ACCESS_TOKEN;

app.post('/api/suggest', async (req, res) => {
  const { text } = req.body;
  try {
    const response = await hf.textGeneration({
      model: 'gpt2',
      inputs: `Suggest improvements or next sentence for: "${text}"`,
      parameters: { max_new_tokens: 150 },
      headers: { Authorization: `Bearer ${HF_TOKEN}` }
    });
    res.json({ suggestion: response.generated_text });
  } catch (err) {
    console.error('Error with Hugging Face API:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error fetching suggestion from Hugging Face API', details: err.message });
  }
});
// Route to get all documents created by the logged-in user
// app.get('/api/documents', async (req, res) => {
//   const userId = req.query.userId; // Pass the user ID from frontend as query parameter

//   try {
//     const documents = await Document.find({ ownerId: userId });
//     res.json(documents);
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });
// Route to delete a document by ID
app.delete('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query; // Get user ID from frontend to verify ownership

  try {
    const doc = await Document.findOne({ _id: id, ownerId: userId });
    if (!doc) return res.status(404).json({ error: 'Document not found or you do not have permission to delete it' });

    await Document.findByIdAndDelete(id);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/api/documents', async (req, res) => {
  try {
    const documents = await Document.find();
    res.json(documents);
  } catch (err) {
    res.status(500).send(err);
  }
});
// Route to get a specific document by ID, including content
app.get('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  const { username } = req.query;

  try {
    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Here, you might want to add any permission checks
    // if required, e.g., if the username has access rights.

    // Respond with the document data, including its content
    res.json({
      _id: doc._id,
      title: doc.title,
      content: doc.content,
      version: doc.version,
      owner: doc.owner
    });
  } catch (err) {
    res.status(500).send(err);
  }
});
// Route to get a specific document by ID, including content and createdAt
// app.get('/api/documents/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     const doc = await Document.findById(id);
//     if (!doc) return res.status(404).json({ error: 'Document not found' });

//     res.json({
//       _id: doc._id,
//       title: doc.title,
//       content: doc.content,
//       version: doc.version,
//       owner: doc.owner,
//       createdAt: doc.createdAt, // Include the creation date
//     });
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });
// Route to delete a document by ID
app.delete('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query; // Get user ID from frontend to verify ownership

  try {
    const doc = await Document.findOne({ _id: id, ownerId: userId });
    if (!doc) return res.status(404).json({ error: 'Document not found or you do not have permission to delete it' });

    await Document.findByIdAndDelete(id);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).send(err);
  }
});

const assignColorToUser = (userId) => {
  if (!colors[userId]) {
    colors[userId] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }
  return colors[userId];
};
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    console.log(`User ${userId} joined room ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('signal', (data) => {
      io.to(data.to).emit('signal', { signal: data.signal, from: data.from });
    });

    // Handle sending messages to a specific user
    socket.on('private-message', ({ to, msg }) => {
      console.log(`Private message from ${socket.id} to ${to}: ${msg}`);
      socket.to(to).emit('private-message', { msg, from: socket.id });
    });

    socket.on('send-message', ({ msg, roomId }) => {
      io.to(roomId).emit('receive-message', { msg, sender: socket.id });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      socket.to(roomId).emit('user-disconnected', socket.id);
    });
  });
});
app.put('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) return res.status(400).json({ error: 'Content is required' });

  try {
    const updatedDoc = await Document.findByIdAndUpdate(
      id,
      { content, updatedAt: new Date() }, // Set updatedAt to current time
      { new: true }
    );
    if (!updatedDoc) return res.status(404).json({ error: 'Document not found' });
    res.json({ message: 'Document updated successfully', updatedAt: updatedDoc.updatedAt });
  } catch (err) {
    res.status(500).json({ error: 'Error updating document' });
  }
});

// app.put('/api/documents/:id', async (req, res) => {
//   const { id } = req.params;
//   const { content } = req.body;

//   if (!content) return res.status(400).json({ error: 'Content is required' });

//   try {
//     const updatedDoc = await Document.findByIdAndUpdate(
//       id,
//       { content },
//       { new: true }
//     );
//     if (!updatedDoc) return res.status(404).json({ error: 'Document not found' });
//     res.json({ message: 'Document updated successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Error updating document' });
//   }
// });

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');
// require('dotenv').config();
// const { HfInference } = require('@huggingface/inference');
// const { v4: uuidv4 } = require('uuid');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: '*' },
// });

// const hf = new HfInference(process.env.HF_API_KEY);

// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:4000'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true
// }));
// app.use(express.json());

// // MongoDB connection
// const mongoURI = 'mongodb+srv://koarsk03:YMZZWwO6lmDKU0zn@cluster0.zfyqj.mongodb.net/';
// mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
//   });

// const documentSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   content: { type: String, default: '' },
//   version: { type: Number, default: 1 },
//   owner: { type: String, required: true },
//   ownerId: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now }
// });
// const Document = mongoose.model('Document', documentSchema);
// app.post('/api/documents', async (req, res) => {
//   const { title, owner, ownerId } = req.body; // Expect ownerId from the frontend
//   if (!title || !owner || !ownerId) {
//     return res.status(400).json({ error: 'Title, owner, and ownerId are required' });
//   }
//   try {
//     const newDoc = await Document.create({ title, owner, ownerId });
//     io.emit('new_document', newDoc);
//     res.json(newDoc);
//   } catch (err) {
//     console.error('Error creating document:', err);
//     res.status(500).send(err);
//   }
// });


// app.get('/api/documents', async (req, res) => {
//   const userId = req.query.userId;
//   try {
//     const documents = await Document.find({ ownerId: userId });
//     res.json(documents);
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });

// app.put('/api/documents/:id', async (req, res) => {
//   const { id } = req.params;
//   const { content } = req.body;
//   if (!content) return res.status(400).json({ error: 'Content is required' });

//   try {
//     const updatedDoc = await Document.findByIdAndUpdate(id, { content }, { new: true });
//     if (!updatedDoc) return res.status(404).json({ error: 'Document not found' });
//     res.json({ message: 'Document updated successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Error updating document' });
//   }
// });

// app.post('/api/suggest', async (req, res) => {
//   const { text } = req.body;
//   try {
//     const response = await hf.textGeneration({
//       model: 'gpt2',
//       inputs: `Suggest improvements or next sentence for: "${text}"`,
//       parameters: { max_new_tokens: 150 },
//       headers: { Authorization: `Bearer ${process.env.HF_ACCESS_TOKEN}` }
//     });
//     res.json({ suggestion: response.generated_text });
//   } catch (err) {
//     console.error('Error with Hugging Face API:', err.response?.data || err.message);
//     res.status(500).json({ error: 'Error fetching suggestion from Hugging Face API', details: err.message });
//   }
// });

// const PORT = 4000;
// server.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
