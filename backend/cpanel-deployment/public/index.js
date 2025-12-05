document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Admin panel script loaded");

  // Auto-detect API base URL (works in both local and production)
  const API_BASE = window.location.origin;

  // ===============================
  // 🔹 LOGIN PAGE HANDLER
  // ===============================
  const form = document.getElementById("loginForm");
  const banner = document.getElementById("errorBanner");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Hide error banner
      if (banner) {
        banner.style.display = 'none';
        banner.textContent = '';
      }

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        if (banner) {
          banner.textContent = 'Please enter both email and password';
          banner.style.display = 'block';
        } else {
          alert("Please enter both email and password");
        }
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        console.log("🔹 Login response:", data);

        if (data.success && data.token) {
          localStorage.setItem("token", data.token);
          if (data.user && data.user.name) {
            localStorage.setItem("adminName", data.user.name);
          }
          window.location.href = "/admin/dashboard";
        } else {
          const errorMsg = data.error || "Invalid login credentials";
          if (banner) {
            banner.textContent = errorMsg;
            banner.style.display = 'block';
          } else {
            alert(errorMsg);
          }
        }
      } catch (err) {
        console.error("❌ Login error:", err);
        const errorMsg = "Something went wrong, please try again later.";
        if (banner) {
          banner.textContent = errorMsg;
          banner.style.display = 'block';
        } else {
          alert(errorMsg);
        }
      }
    });
  }

  // ===============================
  // 🔹 DASHBOARD PAGE HANDLER
  // ===============================
  const dashboardContent = document.getElementById("dashboardContent");
  const logoutBtn = document.getElementById("logoutBtn");

  if (dashboardContent) {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Session expired or not logged in. Redirecting to login page...");
      window.location.href = "/admin";
      return;
    }

    // ✅ Verify token
    fetch(`${API_BASE}/api/auth/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🔹 Token verification:", data);

        if (data.success && data.user) {
          dashboardContent.textContent = `Welcome, ${data.user.name} 👋`;
        } else {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token");
          window.location.href = "/admin";
        }
      })
      .catch((err) => {
        console.error("❌ Dashboard load error:", err);
        alert("Failed to load dashboard data.");
      });

    // ✅ Logout handler
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("adminName");
        window.location.href = "/admin";
      });
    }

    // ===============================
    // 🔹 USERS LIST HANDLER
    // ===============================
    const usersBtn = document.getElementById("usersBtn");
    if (usersBtn) {
      usersBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
          alert("Session expired. Please log in again.");
          window.location.href = "/admin";
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/api/admin/users`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          console.log("🔹 Users response:", data);

          if (data.success) {
            const list = data.users
              .map(
                (u, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td>${u.role || "user"}</td>
                  </tr>`
              )
              .join("");

            dashboardContent.innerHTML = `
              <h3>All Registered Users</h3>
              <table border="1" cellspacing="0" cellpadding="8">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>${list}</tbody>
              </table>
            `;
          } else {
            alert(data.message || "Failed to load users");
          }
        } catch (err) {
          console.error("❌ Error loading users:", err);
          alert("Could not fetch users list.");
        }
      });
    }
  }
});
