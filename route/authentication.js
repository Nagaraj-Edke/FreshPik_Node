const express = require('express');
const users = require('../model/user.model')
require('dotenv').config();
const jwt = require('jsonwebtoken')
const route = express.Router();

const secretKey = process.env.JWTKey;

async function signup(req, res){
  try{
    let body = req.body
    const emailId = req.body.username;
    const usernameExists = await users.find({username: emailId});
    if(usernameExists.length) {
      res.status(422).send({err: {message: 'Username already exists.', code: 3001}})
    } else {
      const lastUser = await users.findOne({}, {}, { sort: { userId: -1 } });
      const userId = (lastUser?.userId ? lastUser.userId + 1 : 1)
      body = {
        ...body,
        userId: userId
      }
      const document = new users(body)
      await document.save();
      res.send({data: { message: 'singup successful', code: 2000}});
    }

  }catch(e){
    res.status(400).send({err: e.message})
  }

}

async function login(req, res) {
  try{
    const body = req.body;
    const userData = await users.find({username: body.username});
    if(userData.length === 1){
      if(body.password === userData[0].password){
        const token = jwt.sign({ userId:  userData[0].userId}, secretKey);
        const {firstname, lastname, username, userId} = userData[0];
        const user = { firstname, lastname, username, userId }
        res.json({data: {message: 'login success', code: 2000, user, token} });
      } else {
        res.status(401).json({err:{message: 'Incorrect password', code: 4001} })
      }
    }
    else {
      res.status(404).json({err: {message: 'username not found', code: 4000}})
    }
  }
  catch(e)  {
    res.send({err: {message: e.message}})
  }
}

async function verifyToken(req, res) {
  const token = req.headers['authorization']
  jwt.verify(token, secretKey, async(err, decoded) => {
    if (err) {
      res.json({ valid: false });
    } else {
      const userData = await users.find({userId: decoded?.userId},{_id: 0, __v: 0, password: 0, address: 0})
      res.json({ valid: true , user: userData[0]});
    }
  });
}


route.post('/signup', signup);
route.post('/login', login);
route.get('/verify-token', verifyToken);

module.exports = route;