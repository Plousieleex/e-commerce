import dotenv from 'dotenv';
// import prisma

process.on('uncaughtException', () => {
  process.exit(1);
});

dotenv.config({ path: './env' });
import app from './src/app';

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  server.close(() => {
    process.exit(1);
  });
});
