require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mainRouter = require('./api/index.js'); 

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', mainRouter);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
