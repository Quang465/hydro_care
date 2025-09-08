const SUPABASE_URL = "https://nrxtyqqpxzoyyyfltwqs.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yeHR5cXFweHpveXl5Zmx0d3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzkxOTksImV4cCI6MjA3MTA1NTE5OX0.o5UC5nHA0TZd5Z8b3PNjlzY7rqbYCNbJMvjVkO59r3w";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const urlParams = new URLSearchParams(window.location.search);
const espId = urlParams.get("esp_id");

// Elements
const espIdP = document.getElementById("esp-id");
const temperatureDiv = document.getElementById("temperature");
const tdsDiv = document.getElementById("tds");
const phDiv = document.getElementById("ph");
const turbidityDiv = document.getElementById("turbidity");
const fishSelect = document.getElementById("fish-select");

// Chuẩn thông số
const fishStandards = {
  fish1: { temperature: [20, 28], tds: [200, 400], ph: [6.5, 7.5], turbidity: [0, 50] },
  fish2: { temperature: [22, 30], tds: [150, 350], ph: [6.8, 7.2], turbidity: [0, 40] },
  fish3: { temperature: [18, 26], tds: [100, 300], ph: [6.0, 7.0], turbidity: [0, 60] },
};

// đánh giá thông số
function checkStatus(value, [min, max]) {
  if (value < min) return "Thấp";
  if (value > max) return "Cao";
  return "Tốt";
}

const TIME_WINDOW = 10 * 60 * 1000; // 10 phút

function createChart(ctx, label, yLabel) {
  return new Chart(ctx, {
    type: "line",
    data: { datasets: [{ label: label, data: [], borderWidth: 2, pointRadius: 2 }] },
    options: {
      animation: false,
      responsive: true,
      scales: {
        x: {
          type: "time",
          time: { unit: "minute", tooltipFormat: "HH:mm:ss" },
        },
        y: {
          title: { display: true, text: yLabel },
        },
      },
      plugins: { legend: { display: false } },
    },
  });
}

// tạo đồ thị
const tdsChart = createChart(document.getElementById("tds-chart"), "TDS", "ppm");
const turbidityChart = createChart(document.getElementById("turbidity-chart"), "Turbidity", "NTU");
const tempChart = createChart(document.getElementById("temp-chart"), "Temperature", "°C");
const phChart = createChart(document.getElementById("ph-chart"), "pH", "pH");

function addPoint(chart, timestamp, value) {
  chart.data.datasets[0].data.push({ x: timestamp, y: value });
  const cutoff = Date.now() - TIME_WINDOW;
  chart.data.datasets[0].data = chart.data.datasets[0].data.filter(
    (p) => new Date(p.x).getTime() >= cutoff
  );
  chart.update("none");
}

// lấy dữ liệu
function renderData(data) {
  const fishType = fishSelect.value;
  const standard = fishStandards[fishType];
  temperatureDiv.innerText = `Nhiệt độ: ${data.temperature}°C (${checkStatus(
    data.temperature,
    standard.temperature
  )})`;
  tdsDiv.innerText = `TDS: ${data.tds} ppm (${checkStatus(data.tds, standard.tds)})`;
  phDiv.innerText = `pH: ${data.ph} (${checkStatus(data.ph, standard.ph)})`;
  turbidityDiv.innerText = `Độ đục: ${data.turbidity} NTU (${checkStatus(
    data.turbidity,
    standard.turbidity
  )})`;
}

// Load history
async function loadHistory() {
  if (!espId) return;
  const since = new Date(Date.now() - TIME_WINDOW).toISOString();
  const { data, error } = await supabase
    .from("sensors_data")
    .select("temperature, tds, ph, turbidity, created_at")
    .eq("device_id", espId)
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }
  if (!data || data.length === 0) return;

  [tdsChart, turbidityChart, tempChart, phChart].forEach(
    (c) => (c.data.datasets[0].data = [])
  );

  data.forEach((row) => {
    const t = new Date(row.created_at);
    addPoint(tdsChart, t, row.tds);
    addPoint(turbidityChart, t, row.turbidity);
    addPoint(tempChart, t, row.temperature);
    addPoint(phChart, t, row.ph);
  });

  renderData(data[data.length - 1]);
}

// Realtime
function subscribeRealtime() {
  if (!espId) return;
  supabase
    .channel("sensors-channel:" + espId)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "sensors_data",
        filter: `device_id=eq.${espId}`,
      },
      (payload) => {
        const row = payload.new;
        const t = new Date(row.created_at);
        renderData(row);
        addPoint(tdsChart, t, row.tds);
        addPoint(turbidityChart, t, row.turbidity);
        addPoint(tempChart, t, row.temperature);
        addPoint(phChart, t, row.ph);
      }
    )
    .subscribe();
}

// nút chuyển về dashboard
document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

// cập nhật esp-id và fish-type vào bảng device_config
async function updateDeviceConfig(deviceId, fishType) {
  try {
    const { data, error } = await supabase
      .from("device_config")
      .upsert(
        { device_id: deviceId, fish_type: fishType },
        { onConflict: ["device_id"] }
      );

    if (error) {
      console.error("Lỗi khi cập nhật device_config:", error);
    } else {
      console.log("Đã cập nhật device_config:", data);
    }
  } catch (err) {
    console.error("Lỗi khi gọi supabase:", err);
  }
}


// khi chọn loại cá
fishSelect.addEventListener("change", () => {
  loadHistory();
  updateDeviceConfig(espId, fishSelect.value);
});

// khi load trang có espId thì cũng update device_config
if (espId) {
  espIdP.innerText = "Device ID: " + espId;
  updateDeviceConfig(espId, fishSelect.value);
} else {
  espIdP.innerText = "No device selected";
}

// khởi chạy
(async () => {
  loadHistory();
  subscribeRealtime();
})();
