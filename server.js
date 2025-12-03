import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express()

app.get("/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});