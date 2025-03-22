// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

// Firebase configuration
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
const toggleMotorBtn = document.getElementById('toggleMotor');
const timerInput = document.getElementById('timerInput');
const setTimerBtn = document.getElementById('setTimer');

let currentCommand = "OFF";

// Listen for water level updates
onValue(ref(database, 'water_level'), (snapshot) => {
  const level = snapshot.val();
  waterLevelEl.textContent = level !== null ? level : "--";
});

// Listen for water quality updates
onValue(ref(database, 'water_quality'), (snapshot) => {
  const quality = snapshot.val();
  waterQualityEl.textContent = quality !== null ? quality : "--";
});

// Listen for motor status updates
onValue(ref(database, 'motor_control/status'), (snapshot) => {
  const status = snapshot.val();
  motorStatusEl.textContent = status !== null ? status : "--";
});

// Listen for command changes to update toggle button text and style
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

// Toggle motor command on button click
toggleMotorBtn.addEventListener('click', () => {
  const newCommand = currentCommand === "ON" ? "OFF" : "ON";
  set(ref(database, 'motor_control/command'), newCommand);
});

// Set timer for motor operation
setTimerBtn.addEventListener('click', () => {
  const timerValue = timerInput.value;
  if(timerValue && !isNaN(timerValue)) {
    set(ref(database, 'motor_control/timer'), Number(timerValue))
      .then(() => {
        alert(`Timer set for ${timerValue} seconds.`);
      })
      .catch((error) => {
        console.error("Error setting timer:", error);
      });
  } else {
    alert("Please enter a valid timer value in seconds.");
  }
});
