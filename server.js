require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.log('Unhandled exception. Shutting down');
  // eslint-disable-next-line no-console
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

const PORT = process.env.PORT || 5000;

const DB = process.env.CONNECTION_STRING.replace(
  '<password>',
  process.env.DB_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  // eslint-disable-next-line no-console
  .then(() => console.log('DB connection successfull'));

const server = app.listen(PORT, () =>
  // eslint-disable-next-line no-console
  console.log(`App running on port: ${PORT}`)
);

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.log(err.name, err.message);
  // eslint-disable-next-line no-console
  console.log('Unhandled rejection. Shutting down');
  server.close(() => {
    process.exit(1);
  });
});
