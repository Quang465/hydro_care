// Supabase project keys
const SUPABASE_URL = "https://nrxtyqqpxzoyyyfltwqs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yeHR5cXFweHpveXl5Zmx0d3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzkxOTksImV4cCI6MjA3MTA1NTE5OX0.o5UC5nHA0TZd5Z8b3PNjlzY7rqbYCNbJMvjVkO59r3w";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const messageDiv = document.getElementById("message");

// Xử lý đăng kí
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    messageDiv.innerText = "Register error: " + error.message;
  } else {
    messageDiv.innerText = "Registration successful! Please check your email to confirm.";
  }
});

// Xử lý đăng nhập
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    messageDiv.innerText = "Login error: " + error.message;
  } else {
    messageDiv.innerText = "Login successful! Welcome, " + email;
    // Ở bước sau sẽ redirect sang dashboard.html để nhập esp32_id
    window.location.href = "dashboard.html";

  }
});
