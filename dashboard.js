

const deviceGrid = document.getElementById("deviceGrid");
const addBtn = document.getElementById("addBtn");
let devices = loadDevices();

// --- LocalStorage ---
function saveDevices(devices) {
  localStorage.setItem("espDevices", JSON.stringify(devices));
}
function loadDevices() {
  const saved = localStorage.getItem("espDevices");
  return saved ? JSON.parse(saved) : [];
}

// --- Add ESP ---
async function addDevice() {
  const espInput = document.getElementById("espInput");
  const espId = espInput.value.trim();
  if (!espId) {
    alert("⚠️ Please enter ESP ID");
    return;
  }

  // Kiểm tra trong bảng devices
  let { data: device, error } = await supabase
    .from("devices")
    .select("*")
    .eq("esp_id", espId)
    .single();

  if (error || !device) {
    alert("❌ Unfound ID: " + espId);
    console.error(error);
    return;
  }

  if (!devices.includes(espId)) {
    devices.push(espId);
    saveDevices(devices);
    renderDevices();
  }

  espInput.value = "";
}

// --- Delete ESP ---
function deleteDevice(event, espId) {
  event.stopPropagation();
  devices = devices.filter((id) => id !== espId);
  saveDevices(devices);
  renderDevices();
}

// --- Render ---
function renderDevices() {
  deviceGrid.innerHTML = "";
  devices.forEach((espId) => {
    const card = document.createElement("div");
    card.className = "card";
    card.onclick = () => loadSensorData(espId);

    card.innerHTML = `
      <div class="card-header">
        <strong>${espId}</strong>
        <button class="delete-btn" onclick="deleteDevice(event, '${espId}')">×</button>
      </div>
      <div class="details" id="details-${espId}">Click to load data...</div>
    `;
    deviceGrid.appendChild(card);
  });
}

// --- Load sensor data ---
async function loadSensorData(espId) {
  const detailsDiv = document.getElementById(`details-${espId}`);
  detailsDiv.innerHTML = "Loading...";

  let { data, error } = await supabase
    .from("sensors_data")
    .select("temperature, turbidity, ph, tds, created_at")
    .eq("device_id", espId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    detailsDiv.innerHTML = "Error loading data";
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    detailsDiv.innerHTML = "No data available";
    return;
  }

  detailsDiv.innerHTML = data.map(
    (row) => `
      <div>
        🌡 Temp: ${row.temperature}°C |
        💧 pH: ${row.ph} |
        🌫 Turbidity: ${row.turbidity} NTU |
        🧪 TDS: ${row.tds} ppm
        <br/><small>${new Date(row.created_at).toLocaleTimeString()}</small>
      </div>
    `
  ).join("<hr/>");
}

// --- Init ---
addBtn.addEventListener("click", addDevice);
renderDevices();

// Expose deleteDevice để dùng trong onclick HTML
window.deleteDevice = deleteDevice;
