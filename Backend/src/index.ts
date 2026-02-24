import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas básicas
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'API de The Sustainable Island - Fuentes de Agua',
    version: '1.0.0'
  });
});

// Rutas de fuentes de agua (por implementar)
app.get('/api/fountains', (req: Request, res: Response) => {
  res.json({ 
    message: 'Endpoint para obtener todas las fuentes',
    data: []
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
