const express = require('express');
const os = require('os');
const dns = require('dns');
const Redis = require('ioredis');

const router = express.Router();
const redis = new Redis({
  host: 'redis-container', // nazwa kontenera Redis
  port: 6379
});

router.get('/', (req, res) => {
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
          body { background-color: navy; color: white; font-family: Arial, sans-serif; }
        </style>
        <script>
          function saveData() {
            const data = {
              hostname: '${hostname}',
              address: '${address}',
              platform: '${platform}',
              arch: '${arch}',
              cpus: '${cpus}',
              totalMemory: '${totalMemory}',
              freeMemory: '${freeMemory}'
            };
            fetch('/env/save', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            }).then(response => response.json())
              .then(result => {
                alert(result.message);
              });
          }
        </script>
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
        <button onclick="saveData()">Save Data</button>
      </body>
      </html>
    `);
  });
});

router.post('/save', async (req, res) => {
  const data = req.body;
  try {
    await redis.set('env_data', JSON.stringify(data));
    res.json({ message: 'Data saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving data' });
  }
});

module.exports = router;
