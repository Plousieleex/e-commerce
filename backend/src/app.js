import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import morgan from 'morgan';
import pg from 'pg';
const { Pool } = pg;
import errorMiddleware from '../middlewares/errorMiddleware.js';

// Routers
import authRouter from './modules/auth/auth.routes.js';
import AppError from './utils/AppError.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const PgSessionStore = connectPgSimple(session);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(
  session({
    store: new PgSessionStore({
      pool,
      tableName: 'sessions',
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);

// Routes
app.use('/api/v1/auth', authRouter);

app.use((req, res, next) => {
  next(new AppError(`Page Not Found.`, 404));
});
// Global Error Middleware
app.use(errorMiddleware);

export default app;
