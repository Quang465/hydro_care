// 🔑 Thay URL và anon key bằng key của bạn
const supabaseUrl = "https://nrxtyqqpxzoyyyfltwqs.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yeHR5cXFweHpveXl5Zmx0d3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzkxOTksImV4cCI6MjA3MTA1NTE5OX0.o5UC5nHA0TZd5Z8b3PNjlzY7rqbYCNbJMvjVkO59r3w"
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// =============== AUTH ===============

// Đăng ký
async function signUp() {
  const email = document.getElementById('signupEmail').value
  const password = document.getElementById('signupPassword').value

  const { error } = await supabase.auth.signUp({ email, password })
  if (error) {
    alert("Lỗi đăng ký: " + error.message)
  } else {
    alert("Đăng ký thành công! Hãy đăng nhập.")
  }
}

// Đăng nhập
async function signIn() {
  const email = document.getElementById('loginEmail').value
  const password = document.getElementById('loginPassword').value

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    alert("Lỗi đăng nhập: " + error.message)
  } else {
    // ✅ Đăng nhập thành công -> chuyển sang dashboard.html
    window.location.href = "dashboard.html"
  }
}

// Đăng xuất (sẽ dùng trong dashboard.js)
async function signOut() {
  await supabase.auth.signOut()
  window.location.href = "index.html"   // quay lại login
}

// =============== AUTO REDIRECT ===============

// Kiểm tra trạng thái login khi load trang
supabase.auth.getSession().then(({ data }) => {
  const isLogin = !!data.session

  // Nếu đã login mà đang ở index.html -> chuyển sang dashboard
  if (isLogin && (window.location.pathname.endsWith("index.html") || window.location.pathname === "/")) {
    window.location.href = "dashboard.html"
  }

  // Nếu chưa login mà đang cố vào dashboard -> đá về index
  if (!isLogin && window.location.pathname.endsWith("dashboard.html")) {
    window.location.href = "index.html"
  }
})
