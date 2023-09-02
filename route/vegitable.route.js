const express = require('express')
const vegitables = require('../model/veg.model');
const fruits = require('../model/fruits.model')

const router = express.Router();


async function vegitablesData(req,res) {
  try{
    let data;
    const limit = req.query?.limit;
    if(limit) {
      data = await vegitables.find().limit(limit)
    }
    else data = await vegitables.find();
   
    res.status(200).send(data);
    
  }
  catch(e){
    res.status(400).send(e.message)
  }
}

async function fruitsData(req,res) {
  try{
    let data;
    const limit = req.query?.limit;
    if(limit) {
      data = await fruits.find().limit(limit)
    }
    else data = await fruits.find();
    res.status(200).send(data);
  }
  catch(e){
    res.status(400).send(e.message)
  }
} 

async function getDataByIds(req, res) {
  try{
    const ids = req.body.ids;
    const fruitsData = await fruits.find({_id: {$in: ids}});
    const vegData = await vegitables.find({_id: {$in: ids}});
    res.send({ data: [...vegData, ...fruitsData]})
  }
  catch(e){
    res.status(400).send(e.message)
  }
}
router.get('/vegitables', vegitablesData);
router.get('/fruits', fruitsData);
router.post('/getDataByIds', getDataByIds);

module.exports = router;

