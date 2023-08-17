const express = require('express');
const bodyPasrer = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const router = require('./route/vegitable.route')
const userRoute = require('./route/authentication')
const addressRoute = require('./route/user.address')
const {mongoDB_pass, mongoDB, PORT} = process.env;


const mongoURL = `mongodb+srv://Nag-test:${mongoDB_pass}@mongodb-cluster.ureisnz.mongodb.net/${mongoDB}?retryWrites=true&w=majority`;
const app = express();

mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
  console.log('ConnectedDB');
}).catch((err)=>{
  console.log(err.message)
});

app.use(bodyPasrer.json());
app.use(cors())


app.use('/',userRoute)
app.use('/', router)
app.use('/secured', addressRoute)
app.listen(PORT, ()=>{
  console.log('server started')
})