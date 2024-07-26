const express = require('express');
const os = require('os');
const dns = require('dns');

const router = express.Router();

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

module.exports = router;
