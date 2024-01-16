const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const baseServerURL = `http://localhost:${PORT}/`;

app.use(bodyParser.json());

const dataFilePath = path.join(__dirname, 'data.json');

const generateRandomCode = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += characters[Math.floor(Math.random() * characters.length)];
  }
  return code;
};

const persistData = async (data) => {
  await fs.writeFile(dataFilePath, JSON.stringify(data), 'utf-8');
};

const readData = async () => {
  try {
    const content = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return {};
  }
};

app.post('/url/:url', async (req, res) => {
  const originalURL = req.params.url;

  if (!originalURL) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  const shortenedCode = generateRandomCode();
  const shortenedURL = `${baseServerURL}${shortenedCode}`;

  const data = await readData();
  data[shortenedCode] = originalURL;

  await persistData(data);

  res.status(200).json({shortenedURL});

});



app.get('/:shortCode', async (req, res) => {
  const shortCode = req.params.shortCode;

  const data = await readData();
  const originalURL = data[shortCode];

  if (originalURL) {
    res.json({ url: originalURL });
  } else {
    res.status(404).json({ error: 'Shortened URL not found' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});