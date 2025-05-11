import express from 'express';
import morgan from 'morgan';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.all('*', (req, res, next) => {
  next('PAGE NOT FOUND!', 404);
});

export default app;
