const express = require('express');
const glob = require('glob');
const path = require('path');

const app = express();
const port = 3000;

let challenges = [];

glob.sync('./challenges/*.js').forEach(function(file) {
  challenges.push(require(path.resolve(file)));
});


function getRandomChallenge() {
  return challenges[challenges.length * Math.random() | 0];
};


app.get('/', (req, res) => {
  res.send(getRandomChallenge().info.name);
});

app.listen(port, () => {
  console.log(`revCAPTCHA server listening on port ${port}`);
});