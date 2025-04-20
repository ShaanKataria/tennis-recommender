import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const rackets = JSON.parse(fs.readFileSync('./data/rackets.json'));
const strings = JSON.parse(fs.readFileSync('./data/strings.json'));

app.post('/recommend', (req, res) => {
  const { level, power, control, spin, armSensitive, age, typePreference } = req.body;

  // 🎾 RACKET MATCHING
  let candidateRackets = [];

  if (age < 11) {
    let targetLengths = [];

    if (age <= 4) targetLengths = [17, 19];
    else if (age <= 6) targetLengths = [21];
    else if (age <= 8) targetLengths = [23];
    else if (age <= 10) targetLengths = [26];  // 9 and 10 year olds get only 26"
    else targetLengths = [26];

    candidateRackets = rackets.filter(r =>
      r.level === "Junior" &&
      r.minAge <= age &&
      r.maxAge >= age &&
      targetLengths.includes(r.length)
    );
  } else {
    candidateRackets = rackets.filter(r =>
      r.level === level &&
      r.armFriendly === armSensitive &&
      (!r.minAge && !r.maxAge)
    );
  }

  if (candidateRackets.length === 0 && age >= 11) {
    candidateRackets = rackets.filter(r =>
      r.level === level &&
      (!r.minAge && !r.maxAge)
    );
  }

  if (candidateRackets.length === 0 && age >= 11) {
    candidateRackets = rackets.filter(r =>
      r.armFriendly === armSensitive &&
      (!r.minAge && !r.maxAge)
    );
  }

  if (candidateRackets.length === 0) {
    candidateRackets = rackets.filter(r => !r.minAge && !r.maxAge);
  }

  const bestRacket = candidateRackets[0];
  const isJuniorRacket = bestRacket.length && bestRacket.length < 27;

  // 🧵 STRING MATCHING
  let candidateStrings = strings.filter(s => s.armFriendly === armSensitive);

  if (typePreference) {
    candidateStrings = candidateStrings.filter(s => s.type === typePreference);
  }

  // 🚫 If using a junior racket, exclude poly strings
  if (isJuniorRacket) {
    candidateStrings = candidateStrings.filter(s => s.type !== "Polyester");
  }

  let scoredStrings = candidateStrings.map(string => {
    const spinDiff = Math.abs(string.spin - spin);
    const powerDiff = Math.abs(string.power - power);
    const controlDiff = Math.abs(string.control - control);
    const score = spinDiff + powerDiff + controlDiff;
    return { ...string, score };
  });

  // 🔁 Fallback to same string type only (ignore arm sensitivity)
  if (scoredStrings.length === 0 && typePreference) {
    scoredStrings = strings
      .filter(s => s.type === typePreference && (!isJuniorRacket || s.type !== "Polyester"))
      .map(string => {
        const spinDiff = Math.abs(string.spin - spin);
        const powerDiff = Math.abs(string.power - power);
        const controlDiff = Math.abs(string.control - control);
        const score = spinDiff + powerDiff + controlDiff;
        return { ...string, score };
      });
  }

  // 🔁 Final fallback (any string except poly for juniors)
  if (scoredStrings.length === 0) {
    scoredStrings = strings
      .filter(s => !isJuniorRacket || s.type !== "Polyester")
      .map(string => {
        const spinDiff = Math.abs(string.spin - spin);
        const powerDiff = Math.abs(string.power - power);
        const controlDiff = Math.abs(string.control - control);
        const score = spinDiff + powerDiff + controlDiff;
        return { ...string, score };
      });
  }

  scoredStrings.sort((a, b) => a.score - b.score);
  const bestString = scoredStrings[0];

  // 🎯 TENSION MATCHING
  let tension = 55;
  if (power > control) tension = 50;
  else if (control > power) tension = 58;

  res.json({
    racket: bestRacket.name,
    string: bestString.name,
    tension
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
