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

// Function to render conditions dynamically
function populateConditionsUI() {
  const conditionsDiv = document.getElementById('predefined-conditions');
  if (!conditionsDiv) {
    console.error("predefined-conditions div not found!");
    return;
  }
  conditionsDiv.innerHTML = ''; // Clear previous conditions
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

// Handle condition selection
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

// Function to finalize bets and add spin results
function addSpin(number, color, bet) {
  const spinResult = `${number} ${color}`.trim();
  spins.push(spinResult);

  const outcome = bet && color && bet.toLowerCase() === color.toLowerCase() ? 'Win' : 'Lose';
  bets.push({ bet, outcome, timestamp: new Date().toLocaleTimeString() });

  console.log(`Spin Result: ${spinResult}`);
  console.log(`Your Bet: ${bet} | Outcome: ${outcome}`);

  displayBetHistory();
  generatePredictions();
}

// Display history of bets and outcomes
function displayBetHistory() {
  const spinList = document.getElementById('spin-list');
  spinList.innerHTML = '';
  bets.forEach((bet, index) => {
    const li = document.createElement('li');
    const spin = spins[index] || 'Pending';
    li.textContent = `Bet: ${bet.bet} | Result: ${spin} | Outcome: ${bet.outcome} | Time: ${bet.timestamp}`;
    spinList.appendChild(li);
  });
}

// Generate predictions based on enabled conditions
function generatePredictions() {
  const predictionOutput = document.getElementById('prediction-output');
  predictionOutput.textContent = 'No predictions available.';

  if (spins.length === 0) {
    console.log("No spins available to predict.");
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
    console.log("No predictions matched the current spin history.");
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  console.log("Initializing Roulette Prediction Platform...");
  populateConditionsUI();

  document.getElementById('spin-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const number = document.getElementById('number').value || '';
    const color = document.getElementById('color').value || '';
    const bet = document.getElementById('bet').value || '';

    if (!color && !number) {
      alert("Please enter a valid spin result.");
      return;
    }
    if (!bet) {
      alert("Please place your bet before adding a spin.");
      return;
    }
    addSpin(number, color, bet);
  });

  setupConditionCheckboxes();
});
