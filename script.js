
document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    level: document.getElementById('level').value,
    power: Number(document.getElementById('power').value),
    control: Number(document.getElementById('control').value),
    spin: Number(document.getElementById('spin').value),
    armSensitive: document.getElementById('armSensitive').value === "true",
    age: Number(document.getElementById('age').value),
    typePreference: document.getElementById('stringType').value
  };

  const rackets = JSON.parse(document.getElementById("rackets-data").textContent);
  const strings = JSON.parse(document.getElementById("strings-data").textContent);

  const bestRacket = rackets.find(r =>
    r.level.toLowerCase() === data.level.toLowerCase() &&
    (r.armFriendly === data.armSensitive) &&
    (!r.minAge || (data.age >= r.minAge && data.age <= r.maxAge))
  ) || rackets.find(r => r.level.toLowerCase() === data.level.toLowerCase());

  const bestString = strings
    .filter(s => s.type.toLowerCase().includes(data.typePreference.toLowerCase()))
    .sort((a, b) => {
      const aScore = Math.abs(data.spin - a.spin) + Math.abs(data.power - a.power) + Math.abs(data.control - a.control);
      const bScore = Math.abs(data.spin - b.spin) + Math.abs(data.power - b.power) + Math.abs(data.control - b.control);
      return aScore - bScore;
    })[0];

  const tension = data.armSensitive ? 50 : 55;

  document.getElementById('output').innerHTML = `
    <h2>🎾 Your Recommended Setup</h2>
    <p><strong>Racket:</strong> ${bestRacket ? bestRacket.name : 'No match found'}</p>
    <p><strong>String:</strong> ${bestString ? bestString.name : 'No match found'}</p>
    <p><strong>Suggested Tension:</strong> ${tension} lbs</p>
  `;
});
