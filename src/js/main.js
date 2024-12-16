// Global state
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

  conditionsDiv.innerHTML = ''; // Clear previous content

  conditions.predefined.forEach((condition, index) => {
      const container = document.createElement('div');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `toggle-${condition.id}`;
      checkbox.name = condition.name;
      checkbox.value = index; // Or any identifier for the condition
      checkbox.checked = false; // Optionally set to true if you want them all checked by default

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
          const conditionId = event.target.id.split('-')[1]; // Extract the condition ID from the checkbox ID
          const isChecked = event.target.checked;

          // Here, you would update some data structure or state with this change
          console.log(`Condition ${conditionId} is now ${isChecked ? 'enabled' : 'disabled'}.`);
      });
  });
}


// Function to add a spin result
function addSpin(number, color) {
  const spin = `${number} ${color}`.trim();
  spins.push(spin);

  // Update the spin list
  const spinList = document.getElementById('spin-list');
  const li = document.createElement('li');
  li.textContent = spin;
  spinList.appendChild(li);

  console.log("Spin added:", spin);
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
