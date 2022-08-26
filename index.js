const glob = require('glob');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const redis = require('redis');
const rateLimit = require('express-rate-limit')

const app = express();
const port = 3000;
const rateLimitMs = 60000;

const limiter = rateLimit.rateLimit({
  windowMs: process.env.NODE_ENV === "production" ? rateLimitMs : 1000,
  max: 2,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);
app.use(express.json());

const db = redis.createClient();

let challenges = [];

// Setup

glob.sync('./challenges/*.js').forEach((file) => {
  challenges.push(require(path.resolve(file)));
});

db.connect();

// Functions

function getRandomChallenge() {
  return challenges[challenges.length * Math.random() | 0];
};

// Express app endpoints

app.get('/new', (req, res) => {
  let newChallenge = getRandomChallenge();
  let challengeData = newChallenge.generate();
  challengeData.key = crypto.randomBytes(16).toString('hex');

  db.set(challengeData.key, challengeData.answer.toString(), {EX: newChallenge.info.timeout});
  res.send(JSON.stringify(challengeData));
  return;
});

app.get('/verify', (req, res) => {
  let key = req.body.key;
  let answer = req.body.answer;

  if (!key || !answer) {
    res.status(400);
    res.send('Missing data');
    return;
  };
});

// Start

app.listen(port, () => {
  console.log(`revCAPTCHA server listening on port ${port}`);
});

db.on('error', (err) => {
  console.log('Redis client error:', err);
});