// Lấy esp_id từ URL
const params = new URLSearchParams(window.location.search);
const espId = params.get("esp_id");
document.getElementById("esp-id").innerText = "ESP32 ID: " + espId;

// Nút back
document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

// Mock dữ liệu realtime
const mockData = {
  tds: 300,
  turbidity: 2.5,
  temperature: 26,
  ph: 7.2
};

// Chuẩn của từng loại cá (min-max)
const fishStandards = {
  fish1: { tds: [200, 400], turbidity: [1, 5], temperature: [24, 28], ph: [6.5, 7.5] },
  fish2: { tds: [150, 350], turbidity: [0.5, 4], temperature: [20, 26], ph: [6.8, 7.2] },
  fish3: { tds: [250, 450], turbidity: [1, 6], temperature: [25, 30], ph: [7.0, 8.0] }
};

// Hàm đánh giá thông số
function checkStatus(value, [min, max]) {
  if (value < min) return "thấp";
  if (value > max) return "cao";
  return "tốt";
}

// Hiển thị thông số
function displayValues(fishType) {
  const standard = fishStandards[fishType];

  document.getElementById("tds-value").innerText =
    mockData.tds + " (" + checkStatus(mockData.tds, standard.tds) + ")";
  document.getElementById("turbidity-value").innerText =
    mockData.turbidity + " (" + checkStatus(mockData.turbidity, standard.turbidity) + ")";
  document.getElementById("temp-value").innerText =
    mockData.temperature + " (" + checkStatus(mockData.temperature, standard.temperature) + ")";
  document.getElementById("ph-value").innerText =
    mockData.ph + " (" + checkStatus(mockData.ph, standard.ph) + ")";
}

// Lắng nghe chọn loại cá
const fishSelect = document.getElementById("fish-select");
fishSelect.addEventListener("change", () => {
  displayValues(fishSelect.value);
});

// Hiển thị mặc định fish1
displayValues("fish1");

// --- Vẽ chart mock ---
function createChart(canvasId, label, data) {
  return new Chart(document.getElementById(canvasId), {
    type: 'line',
    data: {
      labels: ["T1","T2","T3","T4","T5"],
      datasets: [{
        label,
        data,
        borderWidth: 2,
        fill: false
      }]
    }
  });
}

createChart("tds-chart", "TDS", [280,300,310,295,300]);
createChart("turbidity-chart", "Turbidity", [2,2.5,2.3,2.6,2.5]);
createChart("temp-chart", "Temperature", [25,26,27,26,26]);
createChart("ph-chart", "pH", [7.0,7.2,7.3,7.1,7.2]);
