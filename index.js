const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const health = require('./routes/health');

const { passport } = require('./middleware/strategy');

mongoose
  .connect(
    'mongodb+srv://user1:mystique@testcluster1-kl5wc.mongodb.net/attendance?retryWrites=true&w=majority',
    { useNewUrlParser: true },
  )
  .then(() => console.log('Connected to Mongo...'))
  .catch(err => console.error('Could not connect to Mongo', err));

const app = express();
app.use(passport.initialize());
app.use(express.json());
app.use('/health', health);
app.use('/auth', require('./routes/auth'));
app.use('/approval', require('./routes/approval'));

const port = process.env.PORT || config.get('port');
app.listen(port, () => console.log(`Listening on port ${port}`));
