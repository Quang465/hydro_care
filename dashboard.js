// Supabase project keys (dùng lại của bạn)
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const logoutBtn = document.getElementById("logout-btn");
const searchBtn = document.getElementById("search-btn");
const espInput = document.getElementById("esp-input");
const messageDiv = document.getElementById("message");
const cardsContainer = document.getElementById("cards-container");

// Kiểm tra session -> nếu chưa login thì quay lại login page
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "index.html"; // hoặc registration.html
  }
})();

// Logout
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "index.html"; // quay lại login
});

// Search esp_id
searchBtn.addEventListener("click", async () => {
  const espId = espInput.value.trim();
  if (!espId) return;

  // Query bảng devices theo cột esp_id
  const { data, error } = await supabase
    .from("devices")
    .select("id, esp_id")   // chọn các cột bạn cần (ở đây chỉ lấy id & esp_id)
    .eq("esp_id", espId)
    .maybeSingle();  // nếu không có sẽ trả về null thay vì lỗi

  // Nếu không tìm thấy
  if (error) {
    console.error(error);
    messageDiv.innerText = "Error checking device!";
    return;
  }
  if (!data) {
    messageDiv.innerText = "Invalid ID";
    return;
  }

  // Nếu tìm thấy → tạo card
  messageDiv.innerText = "Device found: " + espId;

  const card = document.createElement("div");
  card.style.border = "1px solid black";
  card.style.padding = "10px";
  card.style.margin = "10px";
  card.innerText = "ESP32 Device: " + data.esp_id;

  card.addEventListener("click", () => {
    console.log("Clicked on device:", data.esp_id);
    // TODO: load chi tiết + biểu đồ
  });

  cardsContainer.appendChild(card);
});
