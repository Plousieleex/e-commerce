import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import morgan from 'morgan';
import pg from 'pg';
const { Pool } = pg;

// Routers
import authRouter from './modules/auth/auth.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/auth', authRouter);

app.all('*', (req, res, next) => {
  next('PAGE NOT FOUND!', 404);
});

export default app;
