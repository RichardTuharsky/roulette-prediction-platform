// Global state
const spins = []; // Stores spin results
const bets = []; // Stores bets with outcomes
const enabledConditions = new Set(); // Track enabled conditions
let currentBet = null; // Temporary storage for the current bet

const conditions = {
  predefined: [
    {
      id: 'colorStreak',
      name: 'Bet opposite color after a streak',
      description: 'Bet the opposite color if the last three spins are the same color',
      logic: (spins) => {
        const lastThree = spins.slice(-3);
        if (lastThree.every((spin) => spin.includes('Red'))) return 'Black';
        if (lastThree.every((spin) => spin.includes('Black'))) return 'Red';
        return null;
      },
    },
    {
      id: 'martingale',
      name: 'Martingale Strategy',
      description: 'Double the bet on the same color after a loss.',
      logic: () => {
        const lastBet = bets[bets.length - 1];
        if (!lastBet || lastBet.outcome === 'Win') return null;
        return lastBet.bet; // Suggest the same bet after a loss
      },
    },
  ],
};

// Function to handle bet placement
function placeBet() {
  const number = document.getElementById('number').value;
  const color = document.getElementById('bet').value;

  if (!number && !color) {
    alert("Please place a valid bet (number, color, or both).");
    return;
  }

  currentBet = {
    number: number || null, // Save number or null
    color: color || null,   // Save color or null
    timestamp: new Date().toLocaleString(),
  };

  console.log("My Current Bet:", currentBet);

  document.getElementById('bet-status').textContent =
    `Current Bet: ${currentBet.number || 'None'} ${currentBet.color || 'None'}`;
}

// Function to add spin result and log the outcome
function addSpinResult() {
  if (!currentBet) {
    alert("Please place a bet before adding a spin result.");
    return;
  }

  const spinNumber = document.getElementById('number').value;
  const spinColor = document.getElementById('color').value;

  if (!spinNumber || !spinColor) {
    alert("Please enter a valid spin result (number and color).");
    return;
  }

  const spinResult = `${spinNumber} ${spinColor}`;
  spins.push(spinResult);

  // Determine outcome: check if bet matches spin result
  const outcome = (
    (currentBet.number && currentBet.number == spinNumber) ||
    (currentBet.color && currentBet.color.toLowerCase() === spinColor.toLowerCase())
  ) ? "Win" : "Lose";

  bets.push({
    bet: currentBet,
    result: { number: spinNumber, color: spinColor },
    outcome,
    timestamp: new Date().toLocaleString(),
  });

  console.log("Spin Result Added:", bets[bets.length - 1]);

  // Reset the current bet
  currentBet = null;
  document.getElementById('bet-status').textContent = "No bet placed yet.";
  displayBetHistory();
  generatePredictions();
}

// Display spin history
function displayBetHistory() {
  const spinList = document.getElementById('spin-list');
  spinList.innerHTML = ''; // Clear previous entries

  bets.forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = `
      Bet: ${entry.bet.number || 'None'} ${entry.bet.color || 'None'} |
      Result: ${entry.result.number} ${entry.result.color} |
      Outcome: ${entry.outcome} | Time: ${entry.timestamp}`;
    spinList.appendChild(li);
  });
}

// Generate predictions based on enabled conditions
function generatePredictions() {
  const predictionOutput = document.getElementById('prediction-output');
  predictionOutput.textContent = 'No predictions available.';

  if (spins.length === 0) {
    console.log("No spins available for predictions.");
    return;
  }

  let prediction = null;

  conditions.predefined.forEach((condition) => {
    if (enabledConditions.has(condition.id)) {
      const result = condition.logic(spins);
      if (result) {
        prediction = `${condition.name}: ${result}`;
      }
    }
  });

  if (prediction) {
    predictionOutput.textContent = prediction;
    console.log("Prediction:", prediction);
  } else {
    console.log("No predictions matched the spin history.");
  }
}

// Event listeners for bet placement and spin result
document.addEventListener('DOMContentLoaded', () => {
  console.log("Initializing Roulette Prediction Platform...");
  populateConditionsUI();
  setupConditionCheckboxes();

  // Bet placement
  document.getElementById('spin-form').addEventListener('submit', (event) => {
    event.preventDefault();
    placeBet();
    addSpinResult();
  });
});

// Render condition checkboxes dynamically
function populateConditionsUI() {
  const conditionsDiv = document.getElementById('predefined-conditions');
  conditionsDiv.innerHTML = ''; // Clear existing content

  conditions.predefined.forEach((condition) => {
    const container = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `toggle-${condition.id}`;
    checkbox.value = condition.id;

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = condition.name;

    container.appendChild(checkbox);
    container.appendChild(label);
    conditionsDiv.appendChild(container);
  });
}

// Setup condition checkbox listeners
function setupConditionCheckboxes() {
  document.querySelectorAll('input[type="checkbox"][id^="toggle-"]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const conditionId = event.target.value;
      if (event.target.checked) {
        enabledConditions.add(conditionId);
      } else {
        enabledConditions.delete(conditionId);
      }
      generatePredictions();
    });
  });
}
