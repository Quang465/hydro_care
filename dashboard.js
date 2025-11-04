// === Supabase config ===
const SUPABASE_URL = "https://nrxtyqqpxzoyyyfltwqs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yeHR5cXFweHpveXl5Zmx0d3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzkxOTksImV4cCI6MjA3MTA1NTE5OX0.o5UC5nHA0TZd5Z8b3PNjlzY7rqbYCNbJMvjVkO59r3w";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === DOM elements ===
const logoutBtn = document.getElementById("logout-btn");
const searchBtn = document.getElementById("search-btn");
const espInput = document.getElementById("esp-input");
const messageDiv = document.getElementById("message");
const cardsContainer = document.getElementById("cards-container");

// === Kiểm tra session (chưa login thì quay lại index) ===
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "index.html";
  }
})();

// === Logout ===
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "index.html";
});

// === Search + Gán ESP cho user ===
searchBtn.addEventListener("click", handleDeviceSearch);

async function handleDeviceSearch() {
  const espId = espInput.value.trim();
  messageDiv.innerText = "";
  cardsContainer.innerHTML = "";

  if (!espId) {
    messageDiv.innerText = "⚠️ Vui lòng nhập ESP32 ID!";
    return;
  }

  // 🔐 Lấy user hiện tại
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    messageDiv.innerText = "Bạn chưa đăng nhập!";
    return;
  }
  const user = userData.user;

  // 🔍 Kiểm tra thiết bị có tồn tại không
  const { data, error } = await supabase
    .from("devices")
    .select(
      `id, esp_id, created_at, user_id, user:auth.users(email)`
    )
    .eq("esp_id", espId)
    .maybeSingle(); // hoặc .single() / .limit(1).single() tùy phiên bản supabase-js
  
  if (error) {
    console.error("Query error:", error);
    messageDiv.innerText = "Lỗi khi truy vấn thiết bị: " + error.message;
    return;
  }
  
  // Nếu chưa có → thêm mới
  if (!data) {
    const { data: inserted, error: insertError } = await supabase
      .from("devices")
      .insert([{ esp_id: espId, user_id: user.id }])
      .select(`id, esp_id, created_at, user_id, user:auth.users(email)`)
      .single();
  
    if (insertError) {
      console.error("Insert error:", insertError);
      messageDiv.innerText = "Không thể gán thiết bị: " + insertError.message;
      return;
    }
  
    messageDiv.innerText = `✅ Đã gán ESP32 (${espId}) cho ${inserted.user.email}`;
    createDeviceCard(inserted);
    return;
  }
  
  // Nếu thiết bị đã tồn tại
  if (data.user_id === user.id) {
    messageDiv.innerText = `Thiết bị ${espId} đã thuộc về bạn (${data.user?.email || "email không tìm thấy"}).`;
    createDeviceCard(data);
  } else {
    messageDiv.innerText = `❌ Thiết bị ${espId} đã được gán cho tài khoản khác (${data.user?.email || "email không tìm thấy"}).`;
  }

}

// === Hàm tạo card ===
function createDeviceCard(device) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerText = `ESP32 Device: ${device.esp_id}`;

  card.addEventListener("click", () => {
    window.location.href = `card.html?esp_id=${device.esp_id}`;
  });

  cardsContainer.appendChild(card);
}
