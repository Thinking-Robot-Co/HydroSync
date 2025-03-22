// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAz4af9x1vMIL379tvFyrMU_GQXGQpm5Tw",
  authDomain: "motor-pump-control.firebaseapp.com",
  databaseURL: "https://motor-pump-control-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "motor-pump-control",
  storageBucket: "motor-pump-control.appspot.com",
  messagingSenderId: "283332291399",
  appId: "1:283332291399:web:d8c34e9d345b64bb3dba62",
  measurementId: "G-NWF9PDJKB8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Get HTML elements
const waterLevelEl = document.getElementById('waterLevel');
const waterQualityEl = document.getElementById('waterQuality');
const motorStatusEl = document.getElementById('motorStatus');
const timeRemainingEl = document.getElementById('timeRemaining');
const toggleMotorBtn = document.getElementById('toggleMotor');
const timerSelect = document.getElementById('timerSelect');
const customTimerInput = document.getElementById('customTimer');
const setTimerBtn = document.getElementById('setTimer');
const toggleTimerModeBtn = document.getElementById('toggleTimerMode');
const statusIndicator = document.getElementById('statusIndicator');

let currentCommand = "OFF";
let timerMode = false;

// Device status listener (green for online, red for offline)
onValue(ref(database, 'device_status'), (snapshot) => {
  const status = snapshot.val();
  if (status === "online") {
    statusIndicator.classList.remove("red");
    statusIndicator.classList.add("green");
  } else {
    statusIndicator.classList.remove("green");
    statusIndicator.classList.add("red");
  }
});

// Data listeners
onValue(ref(database, 'water_level'), (snapshot) => {
  const level = snapshot.val();
  waterLevelEl.textContent = level !== null ? level : "--";
});

onValue(ref(database, 'water_quality'), (snapshot) => {
  const quality = snapshot.val();
  waterQualityEl.textContent = quality !== null ? quality : "--";
});

onValue(ref(database, 'motor_control/status'), (snapshot) => {
  const status = snapshot.val();
  motorStatusEl.textContent = status !== null ? status : "--";
});

onValue(ref(database, 'motor_control/command'), (snapshot) => {
  const command = snapshot.val();
  currentCommand = command;
  if (command === "ON") {
    toggleMotorBtn.textContent = "Turn OFF Motor";
    toggleMotorBtn.style.backgroundColor = "#ef4444";
  } else {
    toggleMotorBtn.textContent = "Turn ON Motor";
    toggleMotorBtn.style.backgroundColor = "#10b981";
  }
});

// Listener for live time remaining
onValue(ref(database, 'motor_control/time_remaining'), (snapshot) => {
  const remaining = snapshot.val();
  if(remaining !== null){
    // Convert seconds to mm:ss format
    let seconds = parseInt(remaining);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    timeRemainingEl.textContent = `${minutes}m ${seconds}s`;
  } else {
    timeRemainingEl.textContent = "--";
  }
});

// UI Event Listeners

// Show/hide custom timer input when "Custom" is selected
timerSelect.addEventListener('change', () => {
  if (timerSelect.value === "custom") {
    customTimerInput.style.display = "block";
  } else {
    customTimerInput.style.display = "none";
  }
});

// Set Timer button: update Firebase with selected timer (in seconds)
setTimerBtn.addEventListener('click', () => {
  let timerValue;
  if (timerSelect.value === "custom") {
    timerValue = parseInt(customTimerInput.value);
    if (isNaN(timerValue) || timerValue < 1) {
      alert("Please enter a valid custom timer value (in minutes).");
      return;
    }
  } else {
    timerValue = parseInt(timerSelect.value);
  }
  const timerSeconds = timerValue * 60;
  set(ref(database, 'motor_control/timer'), timerSeconds)
    .then(() => {
      alert(`Timer set for ${timerValue} minute(s).`);
    })
    .catch((error) => {
      console.error("Error setting timer:", error);
    });
});

// Toggle Timer Mode button: update Firebase and UI
toggleTimerModeBtn.addEventListener('click', () => {
  timerMode = !timerMode;
  const modeText = timerMode ? "ON" : "OFF";
  toggleTimerModeBtn.textContent = `Timer Mode: ${modeText}`;
  set(ref(database, 'motor_control/timer_mode'), timerMode)
    .catch((error) => {
      console.error("Error updating timer mode:", error);
    });
});

// Toggle Motor button: simply toggle the motor command in Firebase
toggleMotorBtn.addEventListener('click', () => {
  const newCommand = currentCommand === "ON" ? "OFF" : "ON";
  set(ref(database, 'motor_control/command'), newCommand)
    .catch((error) => {
      console.error("Error toggling motor command:", error);
    });
});
