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
    .select("*")
    .eq("esp_id", espId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error(error);
    messageDiv.innerText = "Lỗi khi kiểm tra thiết bị!";
    return;
  }

  // 🆕 Nếu chưa có → thêm mới & gán user_id
  if (!data) {
    const { data: inserted, error: insertError } = await supabase
      .from("devices")
      .insert([{ esp_id: espId, user_id: user.id }])
      .select()
      .single();

    if (insertError) {
      messageDiv.innerText = "Không thể gán thiết bị: " + insertError.message;
      return;
    }

    messageDiv.innerText = `✅ Đã thêm mới ESP32 (${espId}) và gán cho ${user.email}`;
    createDeviceCard(inserted);
    return;
  }

  // ⚙️ Nếu thiết bị đã tồn tại nhưng chưa có user_id → cập nhật user_id
  if (!data.user_id) {
    const { data: updated, error: updateError } = await supabase
      .from("devices")
      .update({ user_id: user.id })
      .eq("esp_id", espId)
      .select()
      .single();

    if (updateError) {
      messageDiv.innerText = "Không thể cập nhật user_id: " + updateError.message;
      return;
    }

    messageDiv.innerText = `✅ ESP32 (${espId}) đã được claim cho ${user.email}`;
    createDeviceCard(updated);
    return;
  }

  // ⚠️ Nếu thiết bị đã có user_id khác → cảnh báo nhưng vẫn hiển thị card
  if (data.user_id !== user.id) {
    messageDiv.innerText = `⚠️ Thiết bị ${espId} đã được claim bởi tài khoản khác. Vẫn hiển thị để test.`;
  } else {
    messageDiv.innerText = `✅ Thiết bị ${espId} thuộc về bạn (${user.email})`;
  }

  createDeviceCard(data);
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
