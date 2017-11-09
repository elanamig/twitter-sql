'use strict';
var express = require('express');
var router = express.Router();
//var tweetBank = require('../tweetBank');
const pgClient = require ('../db');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    //var allTheTweets = tweetBank.list();
    pgClient.query ('SELECT content, name FROM tweets JOIN users ON tweets.user_id=users.id', (err, result) => {
      if (err) return next (err);
      res.render('index', {
        title: 'Twitter.js',
        tweets: result.rows,
        showForm: true
      });
    });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  
  router.get('/users/:username', function(req, res, next){
    //var tweetsForName = tweetBank.find({ name: req.params.username });
    let query = 'SELECT content, name, picture_url FROM tweets JOIN users ON tweets.user_id=users.id WHERE users.name=\''+req.params.username+'\'';
    pgClient.query(query, (err, result)=>{
      if (err) return next (err);
      res.render('index', {
        title: 'Twitter.js',
        tweets: result.rows,
        showForm: true,
        username: req.params.username
      });
    });
    
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    //var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
    let query = `SELECT content, name, picture_url FROM tweets JOIN users ON tweets.user_id=users.id WHERE tweets.id=${req.params.id}`;
    pgClient.query (query, (err, result) => {
      if (err) return next (err);
      res.render('index', {
        title: 'Twitter.js',
        tweets: result.rows // an array of only one element ;-)
      });
    });
    
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    let query = `INSERT INTO tweets (user_id, content) VALUES ( (SELECT id FROM users WHERE name='${req.body.name}'), ${req.body.content}) RETURNING id`;
    //var newTweet = tweetBank.add(req.body.name, req.body.content);
    var ret = pgClient.query(query, (err, result) => {
      if (err) return next (err);
      //{ name: name, content: content, id: data.length }
      console.log(" RESULT FROM RETURNING QUERY ");
      console.log(result.rows);
      var newTweet = {name: req.body.name, content: req.body.content, id: result.rows[0].id};
      io.sockets.emit('new_tweet', newTweet);
      res.redirect('/');
    });  
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
