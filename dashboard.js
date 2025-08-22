// Kết nối Supabase
const SUPABASE_URL = "https://nrxtyqqpxzoyyyfltwqs.supabase.co"; 
const SUPABASE_ANON_KEY =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yeHR5cXFweHpveXl5Zmx0d3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzkxOTksImV4cCI6MjA3MTA1NTE5OX0.o5UC5nHA0TZd5Z8b3PNjlzY7rqbYCNbJMvjVkO59r3w"
;
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const deviceGrid = document.getElementById("deviceGrid");
let devices = loadDevices(); // load từ localStorage

renderDevices(devices);

// Lưu ESP IDs vào localStorage
function saveDevices(devices) {
  localStorage.setItem("espDevices", JSON.stringify(devices));
}
function loadDevices() {
  const saved = localStorage.getItem("espDevices");
  return saved ? JSON.parse(saved) : [];
}

// Thêm ESP mới
async function addDevice() {
  const espInput = document.getElementById("espInput");
  const espId = espInput.value.trim();
  if (!espId) {
    alert("⚠️ Please enter ESP ID");
    return;
  }

  // 1. Kiểm tra esp_id có tồn tại trong bảng devices không
  let { data: device, error } = await supabase
    .from("devices")
    .select("*")
    .eq("esp_id", espId)
    .single();

  if (error || !device) {
    console.error("❌ Error or unfound:", error);
    alert("❌ Unfound ID: " + espId);
    return;
  }

  // Nếu tìm thấy -> add vào dashboard
  if (!devices.includes(espId)) {
    devices.push(espId);
    saveDevices(devices);
    renderDevices(devices);
  }

  espInput.value = "";
}

// Render cards
function renderDevices(devices) {
  deviceGrid.innerHTML = "";
  devices.forEach((espId) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong>${espId}</strong>
        <button 
          onclick="deleteDevice(event, '${espId}')" 
          style="color:red;border:none;background:none;font-weight:bold;cursor:pointer;">
          X
        </button>
      </div>
      <div class="details" id="details-${espId}">Click to load data...</div>
    `;
    card.onclick = () => loadSensorData(espId);
    deviceGrid.appendChild(card);
  });
}

// Xóa card
function deleteDevice(event, espId) {
  event.stopPropagation(); // ⛔ không cho lan sang card.onclick
  devices = devices.filter((id) => id !== espId);
  saveDevices(devices);
  renderDevices(devices);
}

// Query dữ liệu sensors_data cho ESP
async function loadSensorData(espId) {
  const detailsDiv = document.getElementById(`details-${espId}`);
  detailsDiv.innerHTML = "Loading...";

  let { data, error } = await supabase
    .from("sensors_data")
    .select("temperature, turbidity, ph, tds, created_at")
    .eq("device_id", espId)
    .order("created_at", { ascending: false })
    .limit(5); // lấy 5 batch gần nhất

  if (error) {
    detailsDiv.innerHTML = "Error loading data";
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    detailsDiv.innerHTML = "No data available";
    return;
  }

  detailsDiv.innerHTML = data
    .map(
      (row) => `
      <div>
        🌡 Temp: ${row.temperature}°C |
        💧 pH: ${row.ph} |
        🌫 Turbidity: ${row.turbidity} NTU |
        🧪 TDS: ${row.tds} ppm
        <br/><small>${new Date(row.created_at).toLocaleTimeString()}</small>
      </div>
    `
    )
    .join("<hr/>");
}
