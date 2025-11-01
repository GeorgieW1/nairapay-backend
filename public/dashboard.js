document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Session expired. Please log in again.");
    window.location.href = "/admin";
    return;
  }

  // Verify Token
  const dashboardContent = document.getElementById("dashboardContent");
  
  if (!dashboardContent) {
    console.error("Dashboard content element not found!");
    return;
  }

  console.log("🔹 Verifying token...");
  
  try {
    const res = await fetch("/api/auth/verify-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log("🔹 Response status:", res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("🔹 Response error:", errorText);
      throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
    }
    
    const data = await res.json();
    console.log("🔹 Token verification data:", data);
    
    if (!data.success) {
      console.error("🔹 Token verification failed:", data.message);
      localStorage.removeItem("token");
      window.location.href = "/admin";
      return;
    }
    
    if (data.user) {
      const userName = data.user.name || data.user.email || "Admin";
      dashboardContent.textContent = `Welcome, ${userName} 👋`;
      console.log("✅ Dashboard loaded successfully");
    } else {
      console.error("🔹 No user data in response");
      dashboardContent.textContent = "Welcome, Admin 👋";
    }
  } catch (error) {
    console.error("❌ Token verification error:", error);
    dashboardContent.textContent = "Failed to load dashboard. Check console for details.";
    dashboardContent.style.color = "red";
  }

  const dashboardSection = document.getElementById("dashboardSection");
  const usersSection = document.getElementById("usersSection");
  const integrationsSection = document.getElementById("integrationsSection");

  // Sidebar buttons
  document.getElementById("dashboardBtn").onclick = () => {
    dashboardSection.classList.remove("hidden");
    usersSection.classList.add("hidden");
    integrationsSection.classList.add("hidden");
  };

  document.getElementById("usersBtn").onclick = async () => {
    dashboardSection.classList.add("hidden");
    integrationsSection.classList.add("hidden");
    usersSection.classList.remove("hidden");

    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      tbody.innerHTML = "";

      if (data.success && data.users && data.users.length > 0) {
        data.users.forEach((user, i) => {
          tbody.innerHTML += `
            <tr>
              <td>${i + 1}</td>
              <td>${user.name || "N/A"}</td>
              <td>${user.email || "N/A"}</td>
              <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
            </tr>`;
        });
      } else {
        tbody.innerHTML = "<tr><td colspan='4'>No users found.</td></tr>";
      }
    } catch (err) {
      console.error("Error loading users:", err);
      tbody.innerHTML = "<tr><td colspan='4'>Failed to load users. Please check console for details.</td></tr>";
    }
  };

  // Integrations
  document.getElementById("integrationsBtn").onclick = async () => {
    dashboardSection.classList.add("hidden");
    usersSection.classList.add("hidden");
    integrationsSection.classList.remove("hidden");
    await loadIntegrations();
  };

  async function loadIntegrations() {
    const tbody = document.querySelector("#integrationsTable tbody");
    tbody.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";

    try {
      const res = await fetch("/api/admin/integrations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();

      if (data.success && data.integrations && data.integrations.length > 0) {
        tbody.innerHTML = "";
        data.integrations.forEach((intg, i) => {
          const creds = Array.isArray(intg.credentials) && intg.credentials.length > 0
            ? intg.credentials.map(c => `<b>${c.label || "N/A"}:</b> ${c.valueMasked || "****"}`).join("<br>")
            : "No credentials";
          
          tbody.innerHTML += `
            <tr>
              <td>${i + 1}</td>
              <td>${intg.providerName || "N/A"}</td>
              <td>${intg.category || "N/A"}</td>
              <td>${intg.mode || "N/A"}</td>
              <td>${intg.baseUrl || "N/A"}</td>
              <td>${creds}</td>
              <td><button onclick="deleteIntegration('${intg._id}')">Delete</button></td>
            </tr>`;
        });
      } else {
        tbody.innerHTML = "<tr><td colspan='7'>No integrations found.</td></tr>";
      }
    } catch (err) {
      console.error("Error loading integrations:", err);
      tbody.innerHTML = "<tr><td colspan='7'>Failed to load integrations. Please check console for details.</td></tr>";
    }
  }

  // Add new credential field
  document.getElementById("addCredentialField").onclick = () => {
    const container = document.getElementById("credentialsContainer");
    const div = document.createElement("div");
    div.className = "credential-pair";
    div.innerHTML = `
      <input type="text" placeholder="Label (e.g., Secret Key)" class="label" />
      <input type="text" placeholder="Value" class="value" />
    `;
    container.appendChild(div);
  };

  // Save new integration
  document.getElementById("addIntegrationForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const providerName = document.getElementById("providerName").value;
    const category = document.getElementById("category").value;
    const baseUrl = document.getElementById("baseUrl").value;
    const mode = document.getElementById("mode").value;

    const credentialPairs = Array.from(document.querySelectorAll(".credential-pair")).map(div => {
      const label = div.querySelector(".label").value.trim();
      const value = div.querySelector(".value").value.trim();
      return label && value ? { label, value } : null;
    }).filter(Boolean);

    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ providerName, category, baseUrl, mode, credentials: credentialPairs }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Integration saved!");
        e.target.reset();
        await loadIntegrations();
      } else {
        alert("Failed: " + data.message);
      }
    } catch (err) {
      alert("Error saving integration.");
    }
  });

  // Delete integration
  window.deleteIntegration = async (id) => {
    if (!confirm("Are you sure you want to delete this integration?")) return;
    try {
      const res = await fetch(`/api/admin/integrations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) await loadIntegrations();
      else alert(data.message);
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  // Logout
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("token");
    window.location.href = "/admin";
  };
});

