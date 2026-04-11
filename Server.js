const express = require('express');
const {ethers} = require('ethers');
const app = express();

app.use(express.json());


const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.listen(PORT, () => {
console.log(`Server is running on port "http://localhost:${PORT}"`);
});

