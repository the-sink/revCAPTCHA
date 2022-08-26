const glob = require('glob');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const redis = require('redis');
const rateLimit = require('express-rate-limit')

const app = express();
const port = 3000;
const rateLimitMs = 60000;
const devModeExpiryMultiplier = 10; // Multiplies the challenge timeout/expiry time by the given amount if NODE_ENV is not production
const successKeyExpiryMinutes = 10; // Number of minutes before unused success keys will expire

const production = process.env.NODE_ENV === "production";

const limiter = rateLimit.rateLimit({
  windowMs: production ? rateLimitMs : 1000,
  max: 5,
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

/*
  NEW CHALLENGE Endpoint

  Used to request a new challenge. Will return the challenge instructions, the problem itself, and the challengeKey that is used to confirm the user's answer is correct.
*/
app.get('/new-challenge', (req, res) => {
  let newChallenge = getRandomChallenge();
  let challengeData = newChallenge.generate();
  let problem = challengeData[0];
  let answer = challengeData[1];
  problem.instructions = problem.instructions || newChallenge.info.instructions;
  problem.key = crypto.randomBytes(16).toString('hex');

  db.set(problem.key, answer.toString(), {EX: newChallenge.info.timeout * (production ? 1 : devModeExpiryMultiplier)});

  res.send(JSON.stringify(problem));
  return;
});

/*
  VERIFY CHALLENGE ANSWER Endpoint

  Used to verify the answer to a given challenge is correct. Needs the challengeKey that was provided in /new-challenge, as well as the answer to the challenge.
  Challenge keys are deleted after being read, and their data cannot be re-read. If the data provided by /verify is somehow lost, a new challenge needs to be generated.
  Challenges also have a timeout (this depeends on the challenge type), and is usually quick (less than a minute long). If invalidated, a new challenge needs to be generated.
  Will return a success status if the answer was correct, and if it was, will also return a success key. This key will be used to tell the answer was correct, with certainty.
  This is because even if the client handles both the /new-challenge and /verify endpoints, it can send the server the successKey for it to confirm, possibly simplifying the process.
*/
app.post('/verify', async (req, res) => {
  let key = req.body.key;
  let answer = req.body.answer;

  if (!key || !answer || typeof(key) !== "string") {
    res.status(400);
    res.send('Missing/invalid key or answer');
    return;
  };

  let realAnswer = await db.getDel(key); // getDel will remove the challenge from memory when read (if successful) --- incorrect answers CANNOT be retried, this is for security, and a new challenge must be generated

  if (!(typeof(realAnswer) === "number" || typeof(realAnswer) === "string")) {
    res.status(500);
    res.send('Challenge answer is invalid on the server (this is a bug!)');
    return;
  };

  let valid = String(answer) === String(realAnswer);
  let responseData = {success: valid};

  if (valid) {
    let successKey = crypto.randomBytes(24).toString('hex');

    db.set(successKey, "true", {EX: 60 * successKeyExpiryMinutes});
    responseData.key = successKey;
  };

  res.send(JSON.stringify(responseData)); // can't ensure with certainty that either of these are a type that can be toString()'d, so type casting instead
  return;
});

/*
  CONFIRM SUCCESS Endpoint

  Used to verify that a given successKey is valid - basically whether a challenge was actually successfully completed.
  Returns only a success status telling if the key was valid. All success keys are deleted after one use ('true' success response).
*/
app.post('/confirm-success', async (req, res) => {
  let successKey = req.body.key;

  if (!successKey || typeof(successKey) !== "string" || successKey.length < 48) {
    res.status(400);
    res.send('Missing or invalid key');
    return;
  };

  let keyValid = await db.getDel(successKey);
  res.send(JSON.stringify({success: keyValid === "true"}));
  return;
});

// Start

app.listen(port, () => {
  console.log(`revCAPTCHA server listening on port ${port}, ${production ? '' : 'not '}in production mode`);
});

db.on('error', (err) => {
  console.log('Redis client error:', err);
});