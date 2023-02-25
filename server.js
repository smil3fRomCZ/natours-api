require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
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
  .then(() => console.log('DB connection successfull'));

app.listen(PORT, () => console.log(`App running on port: ${PORT}`));
