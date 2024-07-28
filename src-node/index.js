const express = require('express');
const mongoose = require('mongoose');
const envRouter = require('./env');

const app = express();
app.use(express.json()); // Obsługa JSON

// Połączenie z MongoDB z autoryzacją
const mongoUri = process.env.MONGO_URL;
mongoose.connect(mongoUri).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

const envSchema = new mongoose.Schema({
  hostname: String,
  address: String,
  platform: String,
  arch: String,
  cpus: Number,
  totalMemory: Number,
  freeMemory: Number
});

const Env = mongoose.model('Env', envSchema);

app.use('/env', envRouter(Env));

app.get('/', async (req, res) => {
  try {
    const envs = await Env.find();
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { background-color: green; color: white; font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        <h1>Environment Data</h1>
        <ul>
          ${envs.map(env => `<li>${env.hostname} - ${env.address} - ${env.platform} - ${env.arch} - ${env.cpus} - ${env.totalMemory} - ${env.freeMemory}</li>`).join('')}
        </ul>
      </body>
      </html>
    `);
  } catch (error) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { background-color: green; color: white; font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        <h1>Environment Data</h1>
        <ul>
          <li>Could not connect to MongoDB: ${error.message}</li>
        </ul>
      </body>
      </html>
    `);
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
