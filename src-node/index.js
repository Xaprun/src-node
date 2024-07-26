const express = require('express');
const Redis = require('ioredis');
const envRouter = require('./env');

const app = express();
app.use(express.json()); // Obsługa JSON

const redis = new Redis({
  host: 'redis-container', // nazwa kontenera Redis
  port: 6379
});

app.use('/env', envRouter);

app.get('/', async (req, res) => {
  try {
    const keys = await redis.keys('*');
    const data = await Promise.all(keys.map(async (key) => {
      const type = await redis.type(key);
      let value;
      switch (type) {
        case 'string':
          value = await redis.get(key);
          break;
        case 'list':
          value = await redis.lrange(key, 0, -1);
          break;
        case 'set':
          value = await redis.smembers(key);
          break;
        case 'hash':
          value = await redis.hgetall(key);
          break;
        case 'zset':
          value = await redis.zrange(key, 0, -1);
          break;
        default:
          value = '(unknown type)';
      }
      return { key, type, value };
    }));

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { background-color: green; color: white; font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        <h1>Redis Data</h1>
        <ul>
          ${data.map(item => `<li>${item.key} (Type: ${item.type}): ${JSON.stringify(item.value)}</li>`).join('')}
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
          body { background-color: yellow; color: black; font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        <h1>Redis Data</h1>
        <ul>
          <li>Could not connect to Redis: ${error.message}</li>
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
