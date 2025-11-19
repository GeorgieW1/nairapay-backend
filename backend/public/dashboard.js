document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Session expired. Please log in again.");
    window.location.href = "/admin";
    return;
  }

  // Get all section elements
  const dashboardSection = document.getElementById("dashboardSection");
  const transactionsSection = document.getElementById("transactionsSection");
  const usersSection = document.getElementById("usersSection");
  const integrationsSection = document.getElementById("integrationsSection");
  const paystackSection = document.getElementById("paystackSection");
  
  const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });
  
  let cachedUsers = [];
  let currentTransactionsPage = 1;
  let transactionFilters = {};

  // Sidebar buttons with active state
  const setActiveLink = (activeId) => {
    document.querySelectorAll('.sidebar a').forEach(link => link.classList.remove('active'));
    const activeLink = document.getElementById(activeId);
    if (activeLink) activeLink.classList.add('active');
  };

  // Hide all sections
  const hideAllSections = () => {
    dashboardSection.classList.add("hidden");
    transactionsSection.classList.add("hidden");
    usersSection.classList.add("hidden");
    integrationsSection.classList.add("hidden");
    paystackSection.classList.add("hidden");
  };

  // ===== DASHBOARD SECTION =====
  document.getElementById("dashboardBtn").onclick = async () => {
    hideAllSections();
    dashboardSection.classList.remove("hidden");
    setActiveLink("dashboardBtn");
    await loadAnalytics();
  };

  async function loadAnalytics() {
    try {
      const res = await fetch("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to load analytics");
      
      const { analytics } = await res.json();
      
      // Update stat cards
      document.getElementById("todayRevenue").textContent = currencyFormatter.format(analytics.today.revenue);
      document.getElementById("todayTransactions").textContent = `${analytics.today.transactions} transactions`;
      document.getElementById("activeUsers").textContent = analytics.today.activeUsers;
      document.getElementById("successRate").textContent = `${analytics.today.successRate}%`;
      document.getElementById("monthRevenue").textContent = currencyFormatter.format(analytics.month.revenue);
      document.getElementById("monthTransactions").textContent = `${analytics.month.transactions} transactions`;
      
      // Service breakdown
      const serviceBreakdown = document.getElementById("serviceBreakdown");
      if (analytics.serviceBreakdown.length > 0) {
        serviceBreakdown.innerHTML = analytics.serviceBreakdown.map(s => `
          <div style="margin-bottom: 15px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #d1d5db; font-weight: 500;">${getServiceIcon(s.type)} ${getServiceName(s.type)}</span>
              <span style="color: #22c55e; font-weight: 600;">${currencyFormatter.format(s.revenue)}</span>
            </div>
            <div style="margin-top: 8px; color: #9ca3af; font-size: 13px;">
              ${s.count} transactions • ${s.percentage}% of total
            </div>
          </div>
        `).join('');
      } else {
        serviceBreakdown.innerHTML = '<p style="color: #9ca3af;">No transactions this month</p>';
      }
      
      // Top users
      const tbody = document.querySelector("#topUsersTable tbody");
      if (analytics.topUsers.length > 0) {
        tbody.innerHTML = analytics.topUsers.map(user => `
          <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${currencyFormatter.format(user.totalSpent)}</td>
            <td>${user.transactionCount}</td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = '<tr><td colspan="4">No data available</td></tr>';
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      alert("Failed to load analytics");
    }
  }

  function getServiceIcon(type) {
    const icons = {
      'airtime': '📱',
      'data': '📊',
      'electricity': '⚡',
      'credit': '💰',
      'debit': '💸'
    };
    return icons[type] || '📄';
  }

  function getServiceName(type) {
    const names = {
      'airtime': 'Airtime',
      'data': 'Data',
      'electricity': 'Electricity',
      'credit': 'Wallet Funding',
      'debit': 'Deductions'
    };
    return names[type] || type;
  }

  // ===== TRANSACTIONS SECTION =====
  document.getElementById("transactionsBtn").onclick = async () => {
    hideAllSections();
    transactionsSection.classList.remove("hidden");
    setActiveLink("transactionsBtn");
    await loadTransactions();
  };

  async function loadTransactions(page = 1) {
    try {
      const params = new URLSearchParams({
        page,
        limit: 50,
        ...transactionFilters
      });
      
      const res = await fetch(`/api/admin/transactions?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to load transactions");
      
      const { transactions, pagination } = await res.json();
      
      const tbody = document.querySelector("#transactionsTable tbody");
      if (transactions.length > 0) {
        tbody.innerHTML = transactions.map(tx => `
          <tr>
            <td>${new Date(tx.createdAt).toLocaleString()}</td>
            <td>${tx.userId?.name || 'N/A'}<br><small style="color: #9ca3af;">${tx.userId?.email || ''}</small></td>
            <td>${getServiceIcon(tx.type)} ${getServiceName(tx.type)}</td>
            <td>${currencyFormatter.format(tx.amount)}</td>
            <td><span style="color: ${getStatusColor(tx.status)};">${tx.status}</span></td>
            <td>${tx.description}</td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = '<tr><td colspan="6">No transactions found</td></tr>';
      }
      
      // Pagination
      const paginationDiv = document.getElementById("transactionsPagination");
      paginationDiv.innerHTML = `
        <button ${pagination.page === 1 ? 'disabled' : ''} onclick="window.loadTransactionsPage(${pagination.page - 1})">Previous</button>
        <span>Page ${pagination.page} of ${pagination.pages}</span>
        <button ${pagination.page === pagination.pages ? 'disabled' : ''} onclick="window.loadTransactionsPage(${pagination.page + 1})">Next</button>
      `;
      
      currentTransactionsPage = page;
    } catch (error) {
      console.error("Error loading transactions:", error);
      alert("Failed to load transactions");
    }
  }

  // Make loadTransactions accessible globally for pagination
  window.loadTransactionsPage = loadTransactions;

  function getStatusColor(status) {
    const colors = {
      'completed': '#22c55e',
      'pending': '#f59e0b',
      'failed': '#ef4444'
    };
    return colors[status] || '#9ca3af';
  }

  // Transaction filters
  document.getElementById("applyFilters").onclick = () => {
    transactionFilters = {
      type: document.getElementById("filterType").value,
      status: document.getElementById("filterStatus").value,
      search: document.getElementById("searchTransactions").value
    };
    loadTransactions(1);
  };

  document.getElementById("clearFilters").onclick = () => {
    document.getElementById("filterType").value = '';
    document.getElementById("filterStatus").value = '';
    document.getElementById("searchTransactions").value = '';
    transactionFilters = {};
    loadTransactions(1);
  };

  // ===== USERS SECTION =====
  document.getElementById("usersBtn").onclick = async () => {
    hideAllSections();
    usersSection.classList.remove("hidden");
    setActiveLink("usersBtn");
    await fetchAndRenderUsers();
  };

  async function fetchAndRenderUsers() {
    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      cachedUsers = data.users || [];

      // Populate fund wallet select
      const fundUserSelect = document.getElementById("fundUserSelect");
      const deductUserSelect = document.getElementById("deductUserSelect");
      
      const userOptions = cachedUsers.map(u => 
        `<option value="${u._id}">${u.name} (${u.email})</option>`
      ).join('');
      
      fundUserSelect.innerHTML = '<option value="" disabled selected>Select a user</option>' + userOptions;
      deductUserSelect.innerHTML = '<option value="" disabled selected>Select a user</option>' + userOptions;

      // Render users table
      tbody.innerHTML = cachedUsers.map((user, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${currencyFormatter.format(user.walletBalance || 0)}</td>
          <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        </tr>
      `).join('');
    } catch (error) {
      console.error("Error fetching users:", error);
      tbody.innerHTML = "<tr><td colspan='5'>Failed to load users</td></tr>";
    }
  }

  // Fund wallet form
  document.getElementById("fundWalletForm").onsubmit = async (e) => {
    e.preventDefault();
    const userId = document.getElementById("fundUserSelect").value;
    const amount = document.getElementById("fundAmount").value;
    const note = document.getElementById("fundNote").value;

    try {
      const res = await fetch(`/api/admin/users/${userId}/fund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount), note }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Wallet funded successfully! New balance: ${currencyFormatter.format(data.walletBalance)}`);
        document.getElementById("fundWalletForm").reset();
        await fetchAndRenderUsers();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error("Error funding wallet:", error);
      alert("Failed to fund wallet");
    }
  };

  // Deduct wallet form
  document.getElementById("deductWalletForm").onsubmit = async (e) => {
    e.preventDefault();
    const userId = document.getElementById("deductUserSelect").value;
    const amount = document.getElementById("deductAmount").value;
    const note = document.getElementById("deductNote").value;

    if (!confirm(`Are you sure you want to deduct ${currencyFormatter.format(amount)} from this user's wallet?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/deduct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount), note }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Wallet deducted successfully! New balance: ${currencyFormatter.format(data.walletBalance)}`);
        document.getElementById("deductWalletForm").reset();
        await fetchAndRenderUsers();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error("Error deducting from wallet:", error);
      alert("Failed to deduct from wallet");
    }
  };

  // ===== INTEGRATIONS SECTION =====
  document.getElementById("integrationsBtn").onclick = async () => {
    hideAllSections();
    integrationsSection.classList.remove("hidden");
    setActiveLink("integrationsBtn");
    await loadIntegrations();
  };

  async function loadIntegrations() {
    const tbody = document.querySelector("#integrationsTable tbody");
    tbody.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";

    try {
      const res = await fetch("/api/admin/integrations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch integrations");

      const data = await res.json();
      const integrations = data.integrations || [];

      tbody.innerHTML = integrations.map((int, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${int.providerName}</td>
          <td>${int.category || "N/A"}</td>
          <td>${int.mode || "N/A"}</td>
          <td><code>${int.baseUrl}</code></td>
          <td>${int.credentials?.length || 0} credential(s)</td>
          <td><button onclick="deleteIntegration('${int._id}')">Delete</button></td>
        </tr>
      `).join('');
    } catch (error) {
      console.error("Error loading integrations:", error);
      tbody.innerHTML = "<tr><td colspan='7'>Failed to load integrations</td></tr>";
    }
  }

  // Setup live credentials (one-click)
  document.getElementById("setupLiveCredentialsBtn").onclick = async () => {
    if (!confirm("⚠️ This will DELETE all existing VTpass integrations and create new LIVE ones. Continue?")) {
      return;
    }
    
    const btn = document.getElementById("setupLiveCredentialsBtn");
    const resultDiv = document.getElementById("setupResult");
    
    btn.disabled = true;
    btn.textContent = "Setting up...";
    resultDiv.innerHTML = '<p style="color: #f59e0b;">Setting up live credentials...</p>';

    try {
      const res = await fetch("/api/admin/integrations/setup-live", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      
      if (data.success) {
        resultDiv.innerHTML = `
          <div style="padding: 15px; background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; border-radius: 8px; color: #22c55e;">
            <strong>${data.message}</strong><br>
            ${data.integrations.map(i => `• ${i.category} (${i.mode})`).join('<br>')}
          </div>
        `;
        await loadIntegrations(); // Refresh table
      } else {
        resultDiv.innerHTML = `
          <div style="padding: 15px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; color: #ef4444;">
            <strong>❌ Setup Failed</strong><br>
            ${data.message || data.error}
          </div>
        `;
      }
    } catch (error) {
      resultDiv.innerHTML = `
        <div style="padding: 15px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; color: #ef4444;">
          <strong>❌ Error</strong><br>
          ${error.message}
        </div>
      `;
    } finally {
      btn.disabled = false;
      btn.textContent = "🚀 Setup Live Credentials (One-Click)";
    }
  };

  // Test VTpass connection
  document.getElementById("testVTpassBtn").onclick = async () => {
    const btn = document.getElementById("testVTpassBtn");
    const resultDiv = document.getElementById("testResult");
    
    btn.disabled = true;
    btn.textContent = "Testing...";
    resultDiv.innerHTML = '<p style="color: #f59e0b;">Testing VTpass connection...</p>';

    try {
      const res = await fetch("/api/admin/integrations/test-vtpass", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      
      if (data.success) {
        resultDiv.innerHTML = `
          <div style="padding: 15px; background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; border-radius: 8px; color: #22c55e;">
            <strong>✅ Connection Successful!</strong><br>
            Mode: ${data.mode}<br>
            ${data.balance ? `Balance: ${data.balance}` : ''}
          </div>
        `;
      } else {
        resultDiv.innerHTML = `
          <div style="padding: 15px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; color: #ef4444;">
            <strong>❌ Connection Failed</strong><br>
            ${data.message || data.error}
          </div>
        `;
      }
    } catch (error) {
      resultDiv.innerHTML = `
        <div style="padding: 15px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; color: #ef4444;">
          <strong>❌ Error</strong><br>
          ${error.message}
        </div>
      `;
    } finally {
      btn.disabled = false;
      btn.textContent = "🔌 Test VTpass Connection";
    }
  };

  // Delete integration
  window.deleteIntegration = async (id) => {
    console.log("Delete button clicked for ID:", id);
    
    if (!confirm("⚠️ Are you sure you want to delete this integration?")) {
      console.log("Delete cancelled by user");
      return;
    }

    console.log("Attempting to delete integration:", id);

    try {
      const res = await fetch(`/api/admin/integrations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Delete response status:", res.status);
      const data = await res.json();
      console.log("Delete response data:", data);
      
      if (data.success) {
        alert("✅ Integration deleted successfully!");
        await loadIntegrations();
      } else {
        alert(`❌ Failed to delete: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting integration:", error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  // Add integration form
  document.getElementById("addIntegrationForm").onsubmit = async (e) => {
    e.preventDefault();
    
    const providerName = document.getElementById("providerName").value;
    const category = document.getElementById("category").value;
    const mode = document.getElementById("mode").value;
    const baseUrl = document.getElementById("baseUrl").value;
    
    // Collect credentials
    const credentialPairs = document.querySelectorAll("#credentialsContainer .credential-pair");
    const credentials = [];
    
    credentialPairs.forEach(pair => {
      const label = pair.querySelector(".label").value;
      const value = pair.querySelector(".value").value;
      if (label && value) {
        credentials.push({
          label: label,
          value: value
        });
      }
    });
    
    if (credentials.length === 0) {
      alert("Please add at least one credential");
      return;
    }
    
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          providerName,
          category,
          mode,
          baseUrl,
          credentials
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert("✅ Integration added successfully!");
        document.getElementById("addIntegrationForm").reset();
        await loadIntegrations();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error("Error adding integration:", error);
      alert("Failed to add integration");
    }
  };

  // ===== PAYSTACK SECTION =====
  document.getElementById("paystackBtn").onclick = () => {
    hideAllSections();
    paystackSection.classList.remove("hidden");
    setActiveLink("paystackBtn");
  };

  // ===== LOGOUT =====
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("token");
    window.location.href = "/admin";
  };

  // Load dashboard by default
  setActiveLink("dashboardBtn");
  await loadAnalytics();
});
