// Global state

const enabledConditions = new Set(); // Track which conditions are enabled

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
      logic: (spins) => {
        const lastBet = bets[bets.length - 1];
        if (!lastBet || lastBet.outcome === 'Win') return null; // Skip if no bet or last bet won

        return lastBet.bet; // Suggest the same bet again (Martingale)
      },
    },


    {
      id: 'paroli',
      name: 'Reverse Martingale (Paroli)',
      description: 'Double the bet after a win on the same color.',
      logic: (spins) => {
        const lastSpin = spins[spins.length - 1];
        if (!lastSpin) return null;

        const [_, color] = lastSpin.split(' ');
        return color === 'Red' ? 'Red' : 'Black';
      },
    },

    {
      id: 'dozens',
      name: 'Dozens Strategy',
      description: 'Bet on the dozen that has not appeared in the last 3 spins.',
      logic: (spins) => {
        const lastThreeNumbers = spins.slice(-3).map((spin) => parseInt(spin.split(' ')[0]));
        const dozens = [1, 2, 3];
        const seenDozens = lastThreeNumbers.map((n) => Math.ceil(n / 12)).filter(Boolean);

        return dozens.find((d) => !seenDozens.includes(d)) || null;
      },
    },

    {
      id: 'columns',
      name: 'Columns Strategy',
      description: 'Bet on the column that has not appeared in the last 3 spins.',
      logic: (spins) => {
        const lastThreeNumbers = spins.slice(-3).map((spin) => parseInt(spin.split(' ')[0]));
        const columns = [1, 2, 3];
        const seenColumns = lastThreeNumbers.map((n) => ((n - 1) % 3) + 1).filter(Boolean);

        return columns.find((c) => !seenColumns.includes(c)) || null;
      },
    },

    {
      id: 'hotNumber',
      name: 'Hot Numbers',
      description: 'Bet on the most frequent number in the spin history.',
      logic: (spins) => {
        const numberFrequency = spins.reduce((acc, spin) => {
          const number = spin.split(' ')[0];
          if (!number) return acc;
          acc[number] = (acc[number] || 0) + 1;
          return acc;
        }, {});

        const mostFrequentNumber = Object.entries(numberFrequency)
          .sort((a, b) => b[1] - a[1])[0]?.[0];

        return mostFrequentNumber || null;
      },
    },

    {
      id: 'coldNumber',
      name: 'Cold Numbers',
      description: 'Bet on the least frequent number in the spin history.',
      logic: (spins) => {
        const numberFrequency = spins.reduce((acc, spin) => {
          const number = spin.split(' ')[0];
          if (!number) return acc;
          acc[number] = (acc[number] || 0) + 1;
          return acc;
        }, {});

        const leastFrequentNumber = Object.entries(numberFrequency)
          .sort((a, b) => a[1] - b[1])[0]?.[0];

        return leastFrequentNumber || null;
      },
    },

    {
      id: 'colorAlternation',
      name: 'Color Alternation',
      description: 'Predict that the next spin will alternate color.',
      logic: (spins) => {
        const lastSpin = spins[spins.length - 1];
        if (!lastSpin) return null;

        const [_, color] = lastSpin.split(' ');
        return color === 'Red' ? 'Black' : color === 'Black' ? 'Red' : null;
      },
    },

    {
      id: 'numberRepetition',
      name: 'Number Repetition',
      description: 'Bet that the same number will appear twice in a row.',
      logic: (spins) => {
        const lastSpin = spins[spins.length - 1];
        return lastSpin ? lastSpin.split(' ')[0] : null;
      },
    }



  ],
  userDefined: [],
};

let spins = [];


function populateConditionsUI() {
  const conditionsDiv = document.getElementById('predefined-conditions');

  if (!conditionsDiv) {
    console.error("predefined-conditions div not found!");
    return;
  }

  console.log("Before clear:", conditionsDiv.innerHTML);

  // Remove all children except <h2>
  Array.from(conditionsDiv.children).forEach(child => {
    if (!child.matches('h2')) {
      conditionsDiv.removeChild(child);
    }
  });

  console.log("After clear:", conditionsDiv.innerHTML);

  // Loop through predefined conditions and render checkboxes dynamically
  conditions.predefined.forEach((condition, index) => {
    console.log("Condition being rendered:", condition);

    const container = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `toggle-${condition.id}`;
    checkbox.name = condition.name;
    checkbox.value = index;

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = condition.name;

    container.appendChild(checkbox);
    container.appendChild(label);
    conditionsDiv.appendChild(container);
  });
}





function setupConditionCheckboxes() {
  document.querySelectorAll('input[type="checkbox"][id^="toggle-"]').forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
      const conditionId = event.target.id.split('-')[1];
      const isChecked = event.target.checked;

      if (isChecked) {
        enabledConditions.add(conditionId); // Enable condition
      } else {
        enabledConditions.delete(conditionId); // Disable condition
      }

      console.log("Enabled Conditions:", Array.from(enabledConditions));
      generatePredictions();
    });
  });
}

function generatePredictions() {
  const predictionOutput = document.getElementById('prediction-output');
  predictionOutput.textContent = ''; // Clear previous output

  console.log("Generating predictions...");
  console.log("Spin history:", spins);
  console.log("Enabled Conditions:", Array.from(enabledConditions));

  if (spins.length === 0) {
    predictionOutput.textContent = "Add spins to see predictions.";
    console.log("No spins available for predictions.");
    return;
  }

  let finalPrediction = null;

  conditions.predefined.forEach((condition) => {
    if (enabledConditions.has(condition.id)) {
      const prediction = condition.logic(spins);

      console.log(`Condition "${condition.name}" checked:`, prediction);

      if (prediction) {
        finalPrediction = `${condition.name}: ${prediction}`;
      }
    }
  });

  if (finalPrediction) {
    predictionOutput.textContent = finalPrediction;
    console.log("Final Prediction:", finalPrediction);
  } else {
    predictionOutput.textContent = "No predictions available based on selected conditions.";
    console.log("No conditions returned predictions.");
  }
}





// Function to add a spin result
function addSpin(number, color, bet) {
  const spinResult = `${number} ${color}`.trim(); // Actual spin result
  spins.push(spinResult);

  // Check if bet matches the spin result
  const betOutcome = (bet && color && bet.toLowerCase() === color.toLowerCase()) ? 'Win' : 'Lose';
  bets.push({ bet, outcome: betOutcome }); // Store bet and outcome

  console.log("Spin Result:", spinResult);
  console.log("Your Bet:", bet);
  console.log("Bet Outcome:", betOutcome);

  // Update the spin list visually
  const spinList = document.getElementById('spin-list');
  const li = document.createElement('li');
  li.textContent = `Result: ${spinResult} | Bet: ${bet || 'None'} | Outcome: ${betOutcome}`;
  spinList.appendChild(li);

  generatePredictions();
}


// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded fired: Initializing app...");
  populateConditionsUI();
  setupConditionCheckboxes();

  // Form submission
  document.getElementById('spin-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const number = document.getElementById('number').value || '';
    const color = document.getElementById('color').value || '';

    if (!number && !color) {
      alert("Please select a number or color!");
      return;
    }

    addSpin(number, color);
  });
});
