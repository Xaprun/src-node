const express = require('express');
const Redis = require('ioredis');
const os = require('os');
const dns = require('dns');

const app = express();
const redis = new Redis({
  host: 'redis-container', // nazwa kontenera Redis
  port: 6379
});

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
          body { background-color: green; color: white; font-family: Arial, sans-serif; }
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

app.get('/env', (req, res) => {
  const hostname = os.hostname();
  const platform = os.platform();
  const arch = os.arch();
  const cpus = os.cpus().length;
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();

  dns.lookup(os.hostname(), (err, address) => {
    if (err) {
      return res.send(`<h1>Error fetching IP address: ${err.message}</h1>`);
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { background-color: blue; color: white; font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        <h1>Environment Information</h1>
        <ul>
          <li>Hostname: ${hostname}</li>
          <li>IP Address: ${address}</li>
          <li>OS Platform: ${platform}</li>
          <li>OS Architecture: ${arch}</li>
          <li>Number of CPUs: ${cpus}</li>
          <li>Total Memory: ${totalMemory}</li>
          <li>Free Memory: ${freeMemory}</li>
        </ul>
      </body>
      </html>
    `);
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
