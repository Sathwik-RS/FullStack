// --- 1. Imports ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Loads .env file contents into process.env

// --- 2. App Setup ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- 3. Middleware ---
app.use(cors()); // Allows requests from other origins (like your React app)
app.use(express.json()); // Allows the server to understand JSON data sent in requests

// --- 4. MongoDB Connection ---
const mongoURI = process.env.MONGO_URI; // Get the string from .env file

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Successfully connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// --- 5. Define the Data Schema ---
// This must match the data your React app sends
const GameSchema = new mongoose.Schema({
  playerChoice: String,
  computerChoice: String,
  result: String,
  playerScore: Number,
  computerScore: Number,
  timestamp: {
    type: Date,
    default: Date.now, // Automatically set the time
  },
});

// Create the "Model" (the collection in the DB)
const Game = mongoose.model('Game', GameSchema);

// --- 6. Define API Routes ---
// This is the "waiter" listening for orders from React

// Your React code asks for this: fetch(`${API_URL}/games`)
app.get('/api/games', async (req, res) => {
  try {
    // Find all games, sort by newest first
    const games = await Game.find().sort({ timestamp: -1 });
    res.json(games); // Send the data back as JSON
  } catch (err) {
    res.status(500).json({ message: 'Error fetching games', error: err });
  }
});

// Your React code asks for this: fetch(`${API_URL}/save-game`, { method: 'POST' ... })
app.post('/api/save-game', async (req, res) => {
  try {
    // Create a new game document based on the data sent from React
    const newGame = new Game({
      playerChoice: req.body.playerChoice,
      computerChoice: req.body.computerChoice,
      result: req.body.result,
      playerScore: req.body.playerScore,
      computerScore: req.body.computerScore,
    });

    // Save it to the database
    const savedGame = await newGame.save();
    
    // Send the newly saved game back to React (your React code uses this)
    res.status(201).json(savedGame);
  } catch (err) {
    res.status(500).json({ message: 'Error saving game', error: err });
  }
});

// --- 7. Start the Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});