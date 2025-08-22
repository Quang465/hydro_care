const SUPABASE_URL = "https://nrxtyqqpxzoyyyfltwqs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yeHR5cXFweHpveXl5Zmx0d3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzkxOTksImV4cCI6MjA3MTA1NTE5OX0.o5UC5nHA0TZd5Z8b3PNjlzY7rqbYCNbJMvjVkO59r3w";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Lấy esp_id từ URL
const urlParams = new URLSearchParams(window.location.search);
const espId = urlParams.get("esp_id");

// Elements
const temperatureDiv = document.getElementById("temperature");
const tdsDiv = document.getElementById("tds");
const phDiv = document.getElementById("ph");
const turbidityDiv = document.getElementById("turbidity");
const fishSelect = document.getElementById("fish-select");

// Chuẩn thông số cho từng loài cá (tạm thời)
const fishStandards = {
  "fish1": { temperature: [20, 28], tds: [200, 400], ph: [6.5, 7.5], turbidity: [0, 50] },
  "fish2": { temperature: [22, 30], tds: [150, 350], ph: [6.8, 7.2], turbidity: [0, 40] },
  "fish3": { temperature: [18, 26], tds: [100, 300], ph: [6.0, 7.0], turbidity: [0, 60] }
};

// Hàm check thông số
function checkStatus(value, [min, max]) {
  if (value < min) return "Thấp";
  if (value > max) return "Cao";
  return "Tốt";
}

// Hàm render dữ liệu
function renderData(data) {
  const fishType = fishSelect.value;
  const standard = fishStandards[fishType];

  temperatureDiv.innerText = `Nhiệt độ: ${data.temperature}°C (${checkStatus(data.temperature, standard.temperature)})`;
  tdsDiv.innerText = `TDS: ${data.tds} ppm (${checkStatus(data.tds, standard.tds)})`;
  phDiv.innerText = `pH: ${data.ph} (${checkStatus(data.ph, standard.ph)})`;
  turbidityDiv.innerText = `Độ đục: ${data.turbidity} NTU (${checkStatus(data.turbidity, standard.turbidity)})`;
}

// Lấy dữ liệu mới nhất ban đầu
async function loadLatest() {
  const { data, error } = await supabase
    .from("sensors_data")
    .select("temperature, tds, ph, turbidity")
    .eq("device_id", espId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error loading data:", error);
    return;
  }
  if (data.length > 0) {
    renderData(data[0]);
  }
}

// Lắng nghe realtime thay đổi trong bảng
function subscribeRealtime() {
  supabase
    .channel("sensors-channel")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "sensors_data", filter: `device_id=eq.${espId}` },
      (payload) => {
        console.log("Realtime update:", payload.new);
        renderData(payload.new);
      }
    )
    .subscribe();
}

// Nút back về dashboard
document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

// Khi đổi loại cá thì render lại
fishSelect.addEventListener("change", () => {
  loadLatest();
});

// Gọi hàm
loadLatest();
subscribeRealtime();

