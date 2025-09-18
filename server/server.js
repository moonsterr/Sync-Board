import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);

const server = http.createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listing on http://localhost:3000');
});
