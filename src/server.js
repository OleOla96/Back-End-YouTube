require('dotenv').config();
const express = require('express');
const cors = require('cors');
const credentials = require('./middleware/credentials');
const corsOptions = require('./config/corsOptions');
const cookieParser = require('cookie-parser');
const app = express();
const db = require('./models');
const initDb = require('./initDB');

const route = require('./routes/index');

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);
app.use(cors(corsOptions));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// parse requests of content-type - application/json
app.use(express.json());
app.use(cookieParser());

app.use('/image/avatar', express.static('public/images/avatar'));
app.use('/image/thumbnail', express.static('public/images/thumbnail'));
app.use('/video', express.static('public/videos'));

db.sequelize.sync();
// db.sequelize
//   .sync({ force: true })
//   .then(async () => {
//     console.log('Init Database started !');
//     await initDb.roles();
//   })
//   .then(async () => {
//     await initDb.users();
//   })
//   .then(async () => {
//     await initDb.contents();
//     console.log('Init Database finished !');
//   });

// routes
route(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
