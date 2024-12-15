document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('spin-form');
  const spinList = document.getElementById('spin-list');
  const predictionArea = document.createElement('div');
  predictionArea.id = 'prediction-area';
  document.getElementById('app').appendChild(predictionArea);

  console.log('DOM fully loaded and parsed');


  let spins = [];
  let balance = 100; // Starting balance for strategies
  let martingaleBet = 1; // Initial bet for Martingale
  let dalembertBet = 1; // Initial bet for D'Alembert

  function updatePredictions() {
    predictionArea.innerHTML = '<h2>Betting Predictions</h2>';

    // Martingale
    const lastSpin = spins[spins.length - 1];
    const martingalePrediction = martingale(lastSpin);
    const dalembertPrediction = dalembert(lastSpin);

    // Display predictions
    const martingaleDiv = document.createElement('div');
    martingaleDiv.innerHTML = `<strong>Martingale:</strong> Next bet: ${martingalePrediction} units`;
    predictionArea.appendChild(martingaleDiv);

    const dalembertDiv = document.createElement('div');
    dalembertDiv.innerHTML = `<strong>D'Alembert:</strong> Next bet: ${dalembertPrediction} units`;
    predictionArea.appendChild(dalembertDiv);

    const colorPatternDiv = document.createElement('div');
    colorPatternDiv.innerHTML = `<strong>Color Pattern:</strong> Bet on ${
      colorPattern() ? 'Red' : 'Black'
    }`;
    predictionArea.appendChild(colorPatternDiv);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    console.log('Number dropdown:', document.getElementById('number'));
    console.log('Color dropdown:', document.getElementById('color'));
    // Get selected number and color
    const number = document.getElementById('number').value;
    const color = document.getElementById('color').value;

    console.log('Number value:', number);
    console.log('Color value:', color);

    // Validate input: At least one (number or color) must be selected
    if (!number && !color) {
      alert('Please select at least a number or a color.');
      return;
    }

    // Combine number and color into a single spin result
    const spinResult = (number ? number : '') + (color ? ` ${color}` : '');

    // Add the spin result to the spins array
    spins.push(spinResult.trim());

    // Clear the dropdowns after submission
    document.getElementById('number').value = '';
    document.getElementById('color').value = '';

    // Update the spin list in the UI
    spinList.innerHTML = '';
    spins.forEach((spin) => {
      const li = document.createElement('li');
      li.textContent = spin;
      spinList.appendChild(li);
    });

    // Update predictions
    updatePredictions();
  });


  // Betting Strategies
  function martingale(lastSpin) {
    if (lastSpin === 'loss') {
      martingaleBet *= 2;
    } else {
      martingaleBet = 1;
    }
    return martingaleBet;
  }

  function dalembert(lastSpin) {
    if (lastSpin === 'loss') {
      dalembertBet += 1;
    } else if (dalembertBet > 1) {
      dalembertBet -= 1;
    }
    return dalembertBet;
  }

  function colorPattern() {
    const lastColors = spins.slice(-3);
    if (lastColors.every((spin) => spin.toLowerCase().includes('red'))) {
      return 'Black';
    } else if (lastColors.every((spin) => spin.toLowerCase().includes('black'))) {
      return 'Red';
    }
    return null;
  }
});
