import Express from 'express';
import Mongoose from 'mongoose';
import  CorsOptions  from 'cors';
import  BodyParser  from 'body-parser';
import  uploadroute from './routes/upload.js'



const app = Express();
const db = "mongodb+srv://Sanjeev:Sanju266@cluster0.erlocnt.mongodb.net/FullStack?retryWrites=true&w=majority";
// const multer = require('multer');
// const path = require('path');

app.use(CorsOptions());
app.use(Express.json());

// parse application/x-www-form-urlencoded
app.use(BodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(BodyParser.json());







Mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log(err);
});

// console.log(uploadroute);
app.use('/upload',uploadroute);


app.get('/', (req, res) => {
  res.json({
    name: 'Rest API Backend Server Running Live'
  });
});

app.listen(8000, () => {
  console.log('Listening on port 8000');
});
