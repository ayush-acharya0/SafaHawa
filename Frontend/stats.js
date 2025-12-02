// Using CountAPI for shared statistics
// Namespace: pokhara-pollution-control
// Key: total, smoke, noise, leak
const NAMESPACE = "pokhara-pollution-control-prod";

let reportData = {
  total: 0,
  smoke: 0,
  noise: 0,
  leak: 0,
};

// Function to fetch stats from the shared API
async function fetchStats() {
  try {
    // Fetch Total
    const totalRes = await fetch(
      `https://api.countapi.xyz/get/${NAMESPACE}/total`
    );
    const totalData = await totalRes.json();
    if (totalData.value) reportData.total = totalData.value;

    // Fetch Smoke
    const smokeRes = await fetch(
      `https://api.countapi.xyz/get/${NAMESPACE}/smoke`
    );
    const smokeData = await smokeRes.json();
    if (smokeData.value) reportData.smoke = smokeData.value;

    // Fetch Noise
    const noiseRes = await fetch(
      `https://api.countapi.xyz/get/${NAMESPACE}/noise`
    );
    const noiseData = await noiseRes.json();
    if (noiseData.value) reportData.noise = noiseData.value;

    // Fetch Leak
    const leakRes = await fetch(
      `https://api.countapi.xyz/get/${NAMESPACE}/leak`
    );
    const leakData = await leakRes.json();
    if (leakData.value) reportData.leak = leakData.value;

    updateDisplay();
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Fallback to localStorage if API fails
    const localData = JSON.parse(localStorage.getItem("reportData"));
    if (localData) {
      reportData = localData;
      updateDisplay();
    }
  }
}

// Function to update the stats via API (Hit)
async function updateStats(type) {
  try {
    // Increment Total
    await fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/total`);

    if (type === "Smoke") {
      await fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/smoke`);
    } else if (type === "Noise") {
      await fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/noise`);
    } else if (type === "Leak") {
      await fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/leak`);
    }

    // Re-fetch to ensure we have the latest numbers from everyone
    fetchStats();
  } catch (error) {
    console.error("Error updating stats:", error);
    // Fallback to local update
    updateLocalStats(type);
  }
}

function updateLocalStats(type) {
  reportData.total++;
  if (type === "Smoke") reportData.smoke++;
  else if (type === "Noise") reportData.noise++;
  else if (type === "Leak") reportData.leak++;

  localStorage.setItem("reportData", JSON.stringify(reportData));
  updateDisplay();
}

// Function to animate counters
function animateCounter(id, value) {
  const element = document.getElementById(id);
  if (!element) return;

  let count = 0;
  // If value is 0, just show 0
  if (value === 0) {
    element.textContent = 0;
    return;
  }

  const step = Math.ceil(value / 50);
  const interval = setInterval(() => {
    count += step;
    if (count >= value) {
      count = value;
      clearInterval(interval);
    }
    element.textContent = count;
  }, 20);
}

// Function to update the display with current stats
function updateDisplay() {
  animateCounter("totalReports", reportData.total);
  animateCounter("smokeReports", reportData.smoke);
  animateCounter("noiseReports", reportData.noise);
  animateCounter("leakReports", reportData.leak);
}

// Initialize stats when page loads
window.addEventListener("load", () => {
  // Initialize keys if they don't exist (first time run)
  // Ideally this is done once manually, but for a demo we can try creation
  // Note: countapi auto-creates keys on 'hit', but 'get' might fail if not exists.
  // We will just fetch.
  fetchStats();
  fetchAQI();
});

// Live AQI Functionality
async function fetchAQI() {
  const aqiIndex = document.getElementById("aqi-index");
  const aqiText = document.getElementById("aqi-text");
  const pm25 = document.getElementById("pm25");
  const aqiValue = document.querySelector(".aqi-value");

  if (!aqiIndex) return;

  try {
    // OpenMeteo Air Quality API for Pokhara (28.2096° N, 83.9856° E)
    const response = await fetch(
      "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=28.2096&longitude=83.9856&current=us_aqi,pm2_5"
    );
    const data = await response.json();

    if (data && data.current) {
      const aqi = data.current.us_aqi;
      const pm = data.current.pm2_5;

      aqiIndex.textContent = aqi;
      pm25.textContent = pm;

      // Set Status and Color
      if (aqi <= 50) {
        aqiText.textContent = "Good";
        aqiValue.className = "aqi-value aqi-good";
      } else if (aqi <= 100) {
        aqiText.textContent = "Moderate";
        aqiValue.className = "aqi-value aqi-moderate";
      } else {
        aqiText.textContent = "Unhealthy";
        aqiValue.className = "aqi-value aqi-unhealthy";
      }
    }
  } catch (error) {
    console.error("Error fetching AQI:", error);
    aqiText.textContent = "Unavailable";
  }
}
