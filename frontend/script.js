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

  const res = await fetch('https://tennis-recommender.onrender.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  document.getElementById('output').innerHTML = `
    <h2>🎾 Your Recommended Setup</h2>
    <p><strong>Racket:</strong> ${result.racket}</p>
    <p><strong>String:</strong> ${result.string}</p>
    <p><strong>Suggested Tension:</strong> ${result.tension} lbs</p>
  `;
});
