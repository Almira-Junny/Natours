require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.log(`${err.name}: ${err.message}`);
  console.log('Uncaught Exception. Shutting down server....');
  process.exit(1);
});

const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database Connection Successful!');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(`${err.name}: ${err.message}`);
  console.log('Unhandled Rejection. Shutting down server....');
  server.close(() => {
    process.exit(1);
  });
});
