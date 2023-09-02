const express = require('express');
const users = require('../model/user.model')
require('dotenv').config();
const jwt = require('jsonwebtoken');
const e = require('express');
const route = express.Router();
const secretKey = process.env.JWTKey;

route.get('/getAddresses', async (req, res) => {
  try {
    const userId = req.query.userId;
    const token = req.headers['authorization'];
    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        const userData = await users.find({ userId: userId }, { address: 1, _id: 0 })
        res.json({ address: userData[0].address })
      } else {
        const userData = await users.find({ userId: (decoded?.userId || userId) }, { address: 1, _id: 0 })
        res.json({ valid: true, address: userData[0].address });
      }
    });
  } catch (e) {

    res.status(400).send(e.message)

  }
});

route.post('/addNew/:addressId?', async (req, res) => {
  try {
    const userId = req.query.userId;
    const addressId = req.params.addressId;
    const token = req.headers['authorization'];
    const address = {
      Hno: req.body.Hno,
      street: req.body.street,
      town: req.body.town,
      pincode: req.body.pincode
    }

    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        res.status(401).send({ error: { message: err.message, code: 4001 } });
      }
      else {
        if (addressId) {
          address['id'] = +addressId;
          try {
            const query = { userId: userId };
            const updateDocument = {
              $set: {
                'address.$[e].Hno': address.Hno,
                'address.$[e].street': address.street,
                'address.$[e].town': address.town,
                'address.$[e].pincode': address.pincode
              }
            };
            const arrayFilters = { arrayFilters: [{ 'e.id': addressId }] };
            users.updateOne(query, updateDocument, arrayFilters).then(response => {
              if (response.matchedCount) {
                if (response.modifiedCount) {
                  res.send({ data: { code: 2000, message: 'Address updated successfully.', address } })
                }
                else {
                  res.send({ data: { code: 2100, message: 'Document matched, no changes made' } })
                }
              } else {
                res.status(404).send({ data: { code: 2000, message: 'User not found' } })
              }
            }).catch(e => {
              res.status(400).send({ err: { message: e.message } })
            })
          } catch (e) {
            res.status(400).send(e.message)
          }
          return;
        }
        users.find({ userId: userId }).then((Users) => {
          let user = Users[0], addressId = 1;
          if (user.address.length) {
            user.address.sort((a, b) => a?.id - b?.id);
            addressId = user.address[user.address.length - 1]['id'] + 1 || 1;
          }
          address['id'] = addressId;
          users.findOneAndUpdate({ userId: userId }, { $push: { address: address } }, { new: true }).then((updatedUser) => {
            res.json({ data: {address, code: 2000} })
          }).catch(e => {
            res.status(500).json({ err: { message: e.message, code: 4004 } })
          });
        }).catch(e => {
          res.status(500).json({ err: { code: 4000, msg: e.message } })
        })
      }
    });

  } catch (e) {
    res.status(500).json({ err: { code: 4000, msg: e.message } })
  }
});


route.delete('/removeAddressById/:addressId', (req, res)=>{
  const userId = req.query.userId;
  const addressId = req.params.addressId;
  const token = req.headers['authorization'];

  jwt.verify(token, secretKey, async (err, decoded) => {
    if(err) {
      res.status(401).send({ error: { message: err.message, code: 4001 } });
    }
    else {
      try {
        const result = await users.updateOne(
          { userId: userId },
          { $pull: { address: { id: addressId } } }
        );
    
        if (result.matchedCount === 1 && result.modifiedCount > 0) {
          return res.status(200).json({ message: 'Address removed successfully' });
        } else {
          return res.status(404).json({ error: 'User not found or no address removed' });
        }
      } catch (error) {
        console.error('Error removing address:', error);
        return res.status(500).json({ error: 'An error occurred while removing the address' });
      }
    }
  });
})

route.get('/userDetails', (req, res) => {

  try {
    const token = req.headers['authorization'];
    const userId = +req.query.userId;
    console.log(userId)
    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        res.status(401).send({ error: { message: err.message, code: 4001 } });
      } else {
        if (decoded.userId === userId) {
          let query = {
            $project: {
              _id: 0,
              firstname: 1,
              lastname: 1,
              username: 1,
              userId: 1,
              address: {
                $map: {
                  input: "$address",
                  as: "addr",
                  in: {
                    Hno: "$$addr.Hno",
                    street: "$$addr.street",
                    town: "$$addr.town",
                    pincode: "$$addr.pincode"
                  }
                }
              }
            }
          }
          const userData = await users.aggregate([{ $match: { userId: userId } }, query]);
          res.send({ data: { userDetails: userData[0] } })
        }
        else {
          res.status(401).send({ error: { message: 'userId mismatch', code: 4001, decoded } });
        }
      }
    });
  } catch (e) {
    res.status(500).send({ error: { message: e.message, code: 5000 } });

  }
});

module.exports = route;