'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const jsonParser = bodyParser.json();
const path = require("path");
const passport = require('passport');

const { router: authRouter, localStrategy, jwtStrategy } = require('../auth');
passport.use(jwtStrategy);
const jwtAuth = passport.authenticate('jwt', { session: false });

const {dreamEntry} = require('./models');

router.get('/', jwtAuth, (req, res)=>{
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  console.log(cutoffDate);
  let user = req.user.id;
  return dreamEntry.find({$and: [{user: user}, {submitDate: {"$gte": new Date(cutoffDate), "$lt": new Date()}}]}).populate('user').then(dreams => {
      return res.status(200).json(dreams.map(entry=>entry.serialize()));
    })
    .catch(err => {
      console.log(err);
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

router.get('/:id', jsonParser, jwtAuth, (req, res)=>{
  return dreamEntry.findById(req.params.id)
  .then((entry) => res.json(entry.serialize()))
  .catch(err => {
    console.log(err);
        res.status(500).json({ message: 'Internal server error' });
  });
});

router.post('/', jsonParser, jwtAuth, (req, res) => {
	const requiredFields = ['submitDate', 'keywords', 'mood', 'nightmare', 'lifeEvents', 'content'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    	return res.status(422).json({
      	code: 422,
      	reason: 'ValidationError',
      	message: 'Missing field',
      	location: missingField
    	});
  }
  let newUser;
  //trim whitespace from keyword input strings
 // if(req.user.id){
    newUser = req.user.id;
 // }
 /* else{
    newUser = req.user[0].id;

  }*/
  return dreamEntry.create({

    user: newUser,
    submitDate: req.body.submitDate,
    keywords: req.body.keywords,
    mood: req.body.mood,
    nightmare: req.body.nightmare,
    lifeEvents: req.body.lifeEvents,
    content: req.body.content

  }).then(dream => {
    return res.status(201).json(dream.serialize());
    })
    .catch((err) => {
      console.log(err);
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: `Internal server error, ${err}`});
    });
});

router.put('/:id', jsonParser, jwtAuth, (req, res) => {
  const requiredFields = ['submitDate', 'keywords', 'mood', 'nightmare', 'lifeEvents', 'content'];
  const newObject= {};
  requiredFields.forEach(field => {
    if(field in req.body){
      newObject[field] = req.body[field];
    }
  });
  /*for(let i=0; i<requiredFields.length; i++){
    if(!(requiredFields[i] in req.body)){
          const message = `Missing \`${requiredFields[i]}\` in request body`;
          console.error(message);
          return res.status(400).send(message);
    }
  }*/
  if(req.body.id !== req.params.id){
        const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
        console.error(message);
        return res.status(400).send(message);
  }
  dreamEntry.findByIdAndUpdate(req.params.id,
    {$set: newObject})
  .then(function(entry){
    res.status(204).end()})
  .catch(err => {
    console.log(err);
    res.status(500).json({message: `Internal server error, ${err}`})
  });
});

router.delete('/:id', jsonParser, jwtAuth, (req, res) => {
  dreamEntry.findByIdAndRemove(req.params.id)
  .then(dream => {
  console.log(`Deleted dream entry ID: ${req.params.id}`);
  res.status(204).end();
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({message: 'Internal server error'})
  });
});

router.post('/dream-log', jsonParser, jwtAuth, (req, res) => {
  /*let searchObj = {};
  Object.keys(req.body).forEach(key=>{
      if(key == 'searchKey'){
        searchObj["keywords"] = req.body.searchKey;
      }
      else if(key == 'searchMood'){
        searchObj["mood"] = req.body.searchMood;
      }
     // else if(key == 'searchDate'){
     //   searchObj["submitDate"] = req.body.searchDate;
     // }
    });*/
//make one search object query with reg exp for exact substring match
  let query = req.body.search.toString();
  const user = req.user.id;
  if(query.indexOf(',') != -1){
        query = query.split(', ');
  }
  console.log(query);
  if(typeof query == 'string'){

  return dreamEntry.find({$and: [{user: user}, {$or: [ { 'mood' : { $regex: query, $options: 'i' }}, { 'keywords' : { $regex: query, $options: 'i' }}, { 'content' : { $regex: query, $options: 'i' }}, { 'lifeEvents' : { $regex: query, $options: 'i' }}]}]}).then(function(entries){
    return res.status(200).json({query: query, entries: entries});
  })
  .catch(err => {
    console.log(err);
    if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
    return res.status(500).json({ message: 'Internal server error' });
    });
  }

  if(typeof query === 'object'){
    let regex = [];
    for (let i = 0; i < query.length; i++) {
    regex[i] = new RegExp(query[i]);
    }
    return dreamEntry.find({$and: [{user: user}, {$or: [ { 'mood' : { $in: regex }}, { 'keywords' : { $in: regex }}, { 'content' : { $in: regex }}, { 'lifeEvents' : { $in: regex }}]}]}).then(function(entries){
      return res.status(200).json({query: query, entries: entries});
    })
    .catch(err => {
      console.log(err);
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      return res.status(500).json({ message: 'Internal server error' });
    });
  }
/*  if(Object.keys(req.body) == 'searchMood'){
    return dreamEntry.find({"mood": req.body.searchMood}).then(function(entries){
      return res.status(200).json(entries);
    })
    .catch(err => {
      console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    });
  }
//add whitespace trimming
  if(req.body.searchMood == '' || req.body.searchKey == ' ' || req.body.searchMood == ' ' || req.body.searchKey == ''){
    return dreamEntry.find().then(dreams => {
      return res.status(200).json(dreams.map(entry=>entry.serialize()));//.map(entry => {entry.serialize();}));
    })
    .catch(err => {
      console.log(err);
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
  }*/
});

module.exports = {router};
