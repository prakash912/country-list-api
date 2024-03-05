// app.js
require('dotenv').config();

import express from 'express';
import bodyParser from 'body-parser';
import countryRoutes from './routes/countryRoutes';
import connectDB from './db';

const app = express();
const PORT = process.env.PORT || 8001;

// Connect to MongoDB
console.log(process.env.MONGO_URL,"process.env.MONGO_URL")
connectDB(process.env.MONGO_URL ?? 'default-mongo-url');

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to handle routes related to countries
app.use('/country', countryRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
