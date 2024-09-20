document.addEventListener("DOMContentLoaded", function () {
  loadSavedData();

  var tooltipInputs = document.querySelectorAll(".tooltip-input");

  tooltipInputs.forEach(function (input) {
    // Initialize the title attribute with the input's current value
    input.title = input.value;

    // If inputs are editable, update the title on input events
    input.addEventListener("input", function () {
      input.title = input.value;
    });
  });

  // Save data alerts for user and call to save function.
  var saveButton = document.getElementById("saveButton");
  if (saveButton) {
    saveButton.addEventListener("click", function () {
      var confirmation = window.confirm(
        '"Pip-Boy: Would you like to record your data?"'
      );
      if (confirmation) {
        saveData();
        alert('"Data recorded successfully!"');
      }
    });
  }

  // Reset data alerts for user and call to reset function.
  var resetButton = document.getElementById("resetButton");
  var resetClicked = false;
  if (resetButton) {
    resetButton.addEventListener("click", function () {
      if (!resetClicked) {
        resetClicked = true;
        var confirmation = window.confirm(
          '"Pip-Boy: Would you like to reset your data?"'
        );
        if (confirmation) {
          resetData();
          alert('"Pip-Boy: Data reset successfully!"');
          location.reload();
        } else {
          resetClicked = false;
        }
      }
    });
  }

  // Function that loads saved character sheet data when application is opened.
  function loadSavedData() {
    var savedData = localStorage.getItem("formData");
    if (savedData) {
      var data = JSON.parse(savedData);
      Object.keys(data).forEach(function (key) {
        var element = document.querySelector('[name="' + key + '"]');
        if (element) {
          if (element.tagName === "INPUT") {
            if (element.type === "checkbox") {
              element.checked = data[key];
            } else {
              element.value = data[key];
            }
          } else if (element.tagName === "TEXTAREA") {
            element.value = data[key];
          }
        }
      });
      // After loading data, recalculate weights and derived stats
      updateMaxCarryWeight();
      calculateCurrentWeight();
      updateDerivedStats();
      updateLevelAndRequiredXP();
    }
  }

  // Function to allow user to save character sheet data.
  function saveData() {
    var data = {};
    document.querySelectorAll("input, textarea").forEach(function (input) {
      // Exclude maxCarryWeight inputs from being saved
      if (!input.classList.contains("maxCarryWeight")) {
        if (input.type === "checkbox") {
          data[input.name] = input.checked;
        } else {
          data[input.name] = input.value;
        }
      }
    });
    localStorage.setItem("formData", JSON.stringify(data));
  }

  // Function to allow user to reset character sheet data.
  function resetData() {
    localStorage.removeItem("formData");
    var inputs = document.querySelectorAll(
      'input, textarea, input[type="checkbox"]'
    );
    inputs.forEach(function (input) {
      if (input.type === "checkbox") {
        input.checked = false;
      } else {
        input.value = "";
      }
    });
  }

  // Function to calculate character's maximum carry weight based on Strength stat.
  function updateMaxCarryWeight() {
    var strengthStat =
      parseInt(document.getElementById("strengthStat").value) || 0;
    var maxCarryWeight = 150 + strengthStat * 10;

    // Select all inputs with the class 'maxCarryWeight'
    var maxCarryWeightInputs = document.querySelectorAll(".maxCarryWeight");
    maxCarryWeightInputs.forEach(function (input) {
      input.value = maxCarryWeight;
    });
  }

  // Event listener for Strength stat changes
  document
    .getElementById("strengthStat")
    .addEventListener("input", function () {
      updateMaxCarryWeight();

      var strengthStat = parseInt(this.value) || 0;
      var meleeDamageValue = 0;
      if (strengthStat >= 7 && strengthStat <= 8) {
        meleeDamageValue = 1;
      } else if (strengthStat >= 9 && strengthStat <= 10) {
        meleeDamageValue = 2;
      } else if (strengthStat >= 11) {
        meleeDamageValue = 3;
      }

      document.getElementById("meleeDamageValue").value = meleeDamageValue;

      // Recalculate total weight whenever strength changes
      calculateCurrentWeight();
    });

  // Function to calculate total weight of all weapons and items carried by character.
  function calculateCurrentWeight() {
    var currentWeight = 0;

    // Select all inputs with the class 'weight'
    var weightInputs = document.querySelectorAll(".weight");

    weightInputs.forEach(function (input) {
      var weight = parseFloat(input.value) || 0;
      currentWeight += weight;
    });

    // Select all inputs with the class 'currentCarryWeight'
    var currentCarryWeightInputs = document.querySelectorAll(
      ".currentCarryWeight"
    );
    currentCarryWeightInputs.forEach(function (input) {
      input.value = currentWeight;
    });

    return currentWeight;
  }

  // Add event listeners to all weight inputs to recalculate weight on change
  var weightInputs = document.querySelectorAll(".weight");
  weightInputs.forEach(function (input) {
    input.addEventListener("input", calculateCurrentWeight);
  });

  // Function to calculate required xp for next level.
  function calculateRequiredXP(level) {
    level = Math.max(level, 1);
    if (level === 2) {
      return 100;
    } else {
      return ((level * (level - 1)) / 2) * 100;
    }
  }

  // Function to update level and required xp when current xp requirements are met.
  function updateLevelAndRequiredXP() {
    var xpEarned = parseInt(document.getElementById("xpEarned").value) || 0;
    var charLevel = parseInt(document.getElementById("charLevel").value) || 1;
    var xpToNext = calculateRequiredXP(charLevel);

    while (xpEarned >= xpToNext) {
      charLevel++;
      xpToNext = calculateRequiredXP(charLevel);
    }

    document.getElementById("charLevel").value = charLevel;
    document.getElementById("xpToNext").value = xpToNext;
  }

  // Function to calculate derived stats.
  function updateDerivedStats() {
    var endurance =
      parseFloat(document.getElementById("enduranceStat").value) || 0;
    var luck = parseFloat(document.getElementById("luckStat").value) || 0;
    var agility = parseFloat(document.getElementById("agilityStat").value) || 0;
    var perception =
      parseFloat(document.getElementById("perceptionStat").value) || 0;

    // Calculate maximum hit points.
    var maxHP = endurance + luck;

    var maxHPInput = document.querySelector("input[name='maxHP']");
    if (maxHPInput) {
      maxHPInput.value = maxHP;
    }

    // Calculate Luck Points.
    var luckPoints = Math.floor(luck / 2);
    var luckPointsInput = document.querySelector("input[name='luckPoints']");
    if (luckPointsInput) {
      luckPointsInput.value = luckPoints;
    }

    // Calculate Defense.
    var defenseValue = 0;
    if (agility >= 1 && agility <= 8) {
      defenseValue = 1;
    } else if (agility >= 9) {
      defenseValue = 2;
    }

    document.getElementById("defenseValue").value = defenseValue;

    // Calculate Initiative.
    var initiativeValue = agility + perception;

    document.getElementById("initiativeValue").value = initiativeValue;
  }

  // Event listeners to call updateDerivedStats whenever user updates stats.
  document
    .getElementById("enduranceStat")
    .addEventListener("input", updateDerivedStats);
  document
    .getElementById("luckStat")
    .addEventListener("input", updateDerivedStats);
  document
    .getElementById("agilityStat")
    .addEventListener("input", updateDerivedStats);
  document
    .getElementById("perceptionStat")
    .addEventListener("input", updateDerivedStats);
  document.getElementById("xpEarned").addEventListener("input", function () {
    updateLevelAndRequiredXP();
  });
  document.getElementById("xpToNext").value = 100;

  // Initial calculations on page load
  updateMaxCarryWeight();
  calculateCurrentWeight();
  updateDerivedStats();
  updateLevelAndRequiredXP();

  // **Autosave Feature: Save data every 5 seconds (5000 milliseconds)**
  setInterval(saveData, 5000);
});
