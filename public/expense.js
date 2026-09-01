const API_URL = "/api";

const cashfree = Cashfree({
  mode: "sandbox",
});

const token = localStorage.getItem("token");

const user = JSON.parse(localStorage.getItem("user") || "null");

if (!token) {
  window.location.href = "login.html";
}

let expenses = [];
let historyExpenses = [];

const ITEMS_PER_PAGE = 5;

let expenseCurrentPage = 1;
let leaderboardCurrentPage = 1;

const expenseForm = document.getElementById("expenseForm");

const expenseTableBody = document.getElementById("expenseTableBody");

const totalExpense = document.getElementById("totalExpense");

const totalIncome = document.getElementById("totalIncome");

const expenseCount = document.getElementById("expenseCount");

const username = document.getElementById("username");

const userEmail = document.getElementById("userEmail");

const showId = document.querySelector(".user-avatar");

const logoutBtn = document.getElementById("logoutBtn");

const premiumBtn = document.getElementById("premiumBtn");

const boardBtn = document.getElementById("boardBtn");

const leaderboardOverlay = document.getElementById("leaderboardOverlay");

const closeLeaderboard = document.getElementById("closeLeaderboard");

const leaderboardList = document.getElementById("leaderboardList");

const leaderboardTotal = document.getElementById("leaderboardTotal");

const categoryInput = document.getElementById("category");

const aiStatus = document.getElementById("aiStatus");

const transactionType = document.getElementById("transactionType");

const historyFilter = document.getElementById("historyFilter");

const noteInput = document.getElementById("note");

const expenseMessage = document.getElementById("msg");

let editingExpenseId = null;

const messageBox = document.getElementById("messageBox");

let messageTimeout;

function showMessage(message) {
  if (!messageBox) {
    console.error("Message box not found");

    return;
  }

  clearTimeout(messageTimeout);

  messageBox.textContent = message;

  messageBox.classList.add("show");

  messageTimeout = setTimeout(() => {
    messageBox.classList.remove("show");
  }, 3000);
}

if (user) {
  username.textContent = user.name || "User";

  userEmail.textContent = user.email || "";
}

if (showId && username) {
  showId.textContent = username.textContent.charAt(0).toUpperCase();
}

// Sets premium membership button state
function setPremiumBtn() {
  if (!premiumBtn) {
    return;
  }

  premiumBtn.textContent = "👑 Premium Member";

  premiumBtn.disabled = true;

  premiumBtn.style.opacity = "0.7";

  premiumBtn.style.cursor = "not-allowed";
}

// Checks current user's premium status
function checkPremiumStatus() {
  if (user && user.isPremium === true) {
    setPremiumBtn();
  } else {
    if (boardBtn) {
      boardBtn.style.display = "none";
    }

    if (leaderboardOverlay) {
      leaderboardOverlay.classList.remove("active");
    }
  }
}

// Gets selected transaction type
function getTransactionType() {
  if (transactionType) {
    return (transactionType.value || "expense").toLowerCase();
  }

  return "expense";
}

// Checks whether a transaction is income
function isIncome(transaction) {
  const type = String(
    transaction.type || transaction.transactionType || "",
  ).toLowerCase();

  if (type === "income") {
    return true;
  }

  if (type === "expense") {
    return false;
  }

  const category = String(transaction.category || "").toLowerCase();

  return category === "salary";
}

// Adds a new transaction with note
async function addTransaction(event) {
  event.preventDefault();

  const amount = Number(document.getElementById("amount").value);

  const description = document.getElementById("description").value.trim();

  const note = noteInput ? noteInput.value.trim() : "";

  const type = getTransactionType();

  if (!amount || amount <= 0) {
    // alert("Please enter a valid amount");
    showMessage("Please enter a valid amount!");
    return;
  }

  if (!description) {
    // alert("Please enter description");
    showMessage("Please enter description!");

    return;
  }

  if (editingExpenseId) {
    await updateExpense({
      amount,
      description,
      note,
    });

    return;
  }

  if (aiStatus) {
    aiStatus.textContent = "✨ AI Is Categorizing...";
  }

  try {
    const data = {
      amount,
      description,
      note,
    };

    const response = await fetch(`${API_URL}/expenses`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      if (aiStatus) {
        aiStatus.textContent = "";
      }

      // alert(result.message || "Failed to add transaction");
      showMessage(result.message || "Failed to add transaction!");

      return;
    }

    const generatedCategory =
      result.expense?.category || result.expenses?.category || "Other";

    if (categoryInput) {
      categoryInput.value = generatedCategory;
    }

    if (aiStatus) {
      aiStatus.textContent = `✨ AI categorized as ${generatedCategory}`;
    }

    // alert(result.message || "Transaction added successfully!");
    showMessage(result.message || "Transaction added successfully!");

    expenseForm.reset();

    if (aiStatus) {
      aiStatus.textContent = "";
    }

    await fetchExpenses();

    if (user && user.isPremium === true) {
      await fetchExpenseHistory();
    }
  } catch (error) {
    console.error("Add Transaction Error:", error);

    if (aiStatus) {
      aiStatus.textContent = "";
    }

    // alert("Server error. Please try again.");
    showMessage("Server error. Please try again.");
  }
}

// Fetches current transactions
async function fetchExpenses() {
  try {
    const response = await fetch(`${API_URL}/expenses`, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      // alert(result.message || "Failed to fetch expenses");
      showMessage(result.message || "Failed to fetch expense");

      return;
    }

    expenses = Array.isArray(result) ? result : result.expenses || [];

    expenseCurrentPage = 1;

    displayExpenses();
  } catch (error) {
    console.error("Fetch Expenses Error:", error);
  }
}

// Fetches complete transaction history
async function fetchExpenseHistory() {
  try {
    const response = await fetch(`${API_URL}/history`, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("History fetch failed:", result.message);

      return;
    }

    historyExpenses = Array.isArray(result) ? result : result.historyData || [];

    leaderboardCurrentPage = 1;

    renderLeaderboard();
  } catch (error) {
    console.error("Fetch History Error:", error);
  }
}

// Displays paginated transactions
function displayExpenses() {
  expenseTableBody.innerHTML = "";

  if (!expenses || expenses.length === 0) {
    expenseTableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-icon">
              ₹
            </div>

            <h4>
              No transactions yet
            </h4>

            <p>
              Add your first transaction
              using the form above.
            </p>
          </div>
        </td>
      </tr>
    `;

    totalExpense.textContent = "0";

    if (totalIncome) {
      totalIncome.textContent = "0";
    }

    expenseCount.textContent = "0 transactions";

    renderExpensePagination();

    return;
  }

  let expenseTotal = 0;

  let incomeTotal = 0;

  expenses.forEach((transaction) => {
    const amount = Number(transaction.amount || 0);

    if (isIncome(transaction)) {
      incomeTotal += amount;
    } else {
      expenseTotal += amount;
    }
  });

  totalExpense.textContent = expenseTotal.toFixed(2);

  if (totalIncome) {
    totalIncome.textContent = incomeTotal.toFixed(2);
  }

  expenseCount.textContent = `${expenses.length} ${
    expenses.length === 1 ? "transaction" : "transactions"
  }`;

  const start = (expenseCurrentPage - 1) * ITEMS_PER_PAGE;

  const end = start + ITEMS_PER_PAGE;

  const pageExpenses = expenses.slice(start, end);

  pageExpenses.forEach((transaction, index) => {
    const amount = Number(transaction.amount || 0);

    const income = isIncome(transaction);

    const row = document.createElement("tr");

    const date = new Date(transaction.createdAt);

    const month = date.getMonth() + 1;

    const newDate =
      date.getDate() +
      "/" +
      String(month).padStart(2, "0") +
      "/" +
      date.getFullYear();

    const actualIndex = start + index;

    row.innerHTML = `
        <td>
          ${actualIndex + 1}
        </td>

        <td>
          ${escapeHTML(transaction.description)}
        </td>

        <td>
          ${escapeHTML(transaction.note || "-")}
        </td>

        <td>
          ${escapeHTML(transaction.category || "Other")}
        </td>

        <td>
          ${newDate}
        </td>

        <td class="${income ? "leaderboard-income" : "leaderboard-expense"}">
          ${income ? "+" : "-"}₹${amount.toFixed(2)}
        </td>

        <td>
          <button
            class="delete-btn"
            onclick="deleteExpense(${transaction.id})"
          >
            Delete
          </button>
        </td>

        <td>
           <button class="edit-btn" onclick="editExpense(${transaction.id})">
               Edit
           </button>
        </td>
      `;

    expenseTableBody.appendChild(row);
  });

  renderExpensePagination();
}

// Renders expense pagination
function renderExpensePagination() {
  let pagination = document.getElementById("expensePagination");

  if (!pagination) {
    pagination = document.createElement("div");

    pagination.id = "expensePagination";

    pagination.className = "pagination";

    const tableCard = document.querySelector(".expense-table-card");

    if (tableCard) {
      tableCard.appendChild(pagination);
    }
  }

  pagination.innerHTML = "";

  const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    return;
  }

  const previous = document.createElement("button");

  previous.textContent = "←";

  previous.disabled = expenseCurrentPage === 1;

  previous.onclick = () => {
    if (expenseCurrentPage > 1) {
      expenseCurrentPage--;

      displayExpenses();
    }
  };

  pagination.appendChild(previous);

  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");

    button.textContent = page;

    if (page === expenseCurrentPage) {
      button.classList.add("active");
    }

    button.onclick = () => {
      expenseCurrentPage = page;

      displayExpenses();
    };

    pagination.appendChild(button);
  }

  const next = document.createElement("button");

  next.textContent = "→";

  next.disabled = expenseCurrentPage === totalPages;

  next.onclick = () => {
    if (expenseCurrentPage < totalPages) {
      expenseCurrentPage++;

      displayExpenses();
    }
  };

  pagination.appendChild(next);
}

// Filters history according to selected period
function filterHistoryData() {
  const filter = historyFilter ? historyFilter.value : "all";

  if (filter === "all") {
    return historyExpenses;
  }

  const now = new Date();

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filter === "today") {
    return historyExpenses.filter((transaction) => {
      const date = new Date(transaction.createdAt);

      return date >= todayStart && date <= now;
    });
  }

  if (filter === "weekly") {
    const day = now.getDay();

    const startOfWeek = new Date(now);

    startOfWeek.setDate(now.getDate() - day);

    startOfWeek.setHours(0, 0, 0, 0);

    return historyExpenses.filter((transaction) => {
      const date = new Date(transaction.createdAt);

      return date >= startOfWeek && date <= now;
    });
  }

  if (filter === "monthly") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return historyExpenses.filter((transaction) => {
      const date = new Date(transaction.createdAt);

      return date >= startOfMonth && date <= now;
    });
  }

  return historyExpenses;
}

// Renders filtered leaderboard data
function renderLeaderboard() {
  if (!leaderboardList) {
    return;
  }

  leaderboardList.innerHTML = "";

  const filteredHistory = filterHistoryData();

  let totalExpenseHistory = 0;

  let totalIncomeHistory = 0;

  filteredHistory.forEach((transaction) => {
    const amount = Number(transaction.amount || 0);

    if (isIncome(transaction)) {
      totalIncomeHistory += amount;
    } else {
      totalExpenseHistory += amount;
    }
  });

  const netBalance = totalIncomeHistory - totalExpenseHistory;

  if (leaderboardTotal) {
    leaderboardTotal.innerHTML = `
      <div>
        <small>Total Income</small>

        <strong class="leaderboard-income">
          +₹${totalIncomeHistory.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </strong>
      </div>

      <div>
        <small>Total Expense</small>

        <strong class="leaderboard-expense">
          -₹${totalExpenseHistory.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </strong>
      </div>

      <div>
        <small>Net Balance</small>

        <strong class="${
          netBalance >= 0 ? "leaderboard-income" : "leaderboard-expense"
        }">
          ${netBalance >= 0 ? "+" : "-"}₹${Math.abs(netBalance).toLocaleString(
            "en-IN",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            },
          )}
        </strong>
      </div>
    `;
  }

  if (!filteredHistory || filteredHistory.length === 0) {
    leaderboardList.innerHTML = `
      <div class="leaderboard-empty">
        <div class="leaderboard-empty-icon">
          💸
        </div>

        <p>
          No transactions found.
        </p>

        <p>
          Try another filter.
        </p>
      </div>
    `;

    renderLeaderboardPagination(filteredHistory);

    return;
  }

  const start = (leaderboardCurrentPage - 1) * ITEMS_PER_PAGE;

  const end = start + ITEMS_PER_PAGE;

  const pageHistory = filteredHistory.slice(start, end);

  pageHistory.forEach((transaction, index) => {
    const amount = Number(transaction.amount || 0);

    const income = isIncome(transaction);

    const item = document.createElement("div");

    item.className = "leaderboard-item";

    const left = document.createElement("div");

    left.className = "leaderboard-item-left";

    const description = document.createElement("div");

    description.className = "leaderboard-description";

    description.textContent = `${start + index + 1}. ${
      transaction.description || "Transaction"
    }`;

    const category = document.createElement("span");

    category.className = "leaderboard-category";

    category.textContent = transaction.category || "Other";

    const type = document.createElement("span");

    type.className = income ? "leaderboard-income" : "leaderboard-expense";

    type.textContent = income ? "Income" : "Expense";

    const date = document.createElement("div");

    date.className = "leaderboard-date";

    date.textContent = formatLeaderboardDate(transaction.createdAt);

    left.appendChild(description);

    left.appendChild(category);

    left.appendChild(type);

    left.appendChild(date);

    const amountElement = document.createElement("div");

    amountElement.className = income
      ? "leaderboard-amount leaderboard-income"
      : "leaderboard-amount leaderboard-expense";

    amountElement.textContent = `${income ? "+" : "-"}₹${amount.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;

    item.appendChild(left);

    item.appendChild(amountElement);

    leaderboardList.appendChild(item);
  });

  renderLeaderboardPagination(filteredHistory);
}

// Renders leaderboard pagination
function renderLeaderboardPagination(filteredHistory) {
  let pagination = document.getElementById("leaderboardPagination");

  if (!pagination) {
    pagination = document.createElement("div");

    pagination.id = "leaderboardPagination";

    pagination.className = "pagination";

    if (leaderboardList.parentElement) {
      leaderboardList.parentElement.appendChild(pagination);
    }
  }

  pagination.innerHTML = "";

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    return;
  }

  const previous = document.createElement("button");

  previous.textContent = "←";

  previous.disabled = leaderboardCurrentPage === 1;

  previous.onclick = () => {
    if (leaderboardCurrentPage > 1) {
      leaderboardCurrentPage--;

      renderLeaderboard();
    }
  };

  pagination.appendChild(previous);

  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");

    button.textContent = page;

    if (page === leaderboardCurrentPage) {
      button.classList.add("active");
    }

    button.onclick = () => {
      leaderboardCurrentPage = page;

      renderLeaderboard();
    };

    pagination.appendChild(button);
  }

  const next = document.createElement("button");

  next.textContent = "→";

  next.disabled = leaderboardCurrentPage === totalPages;

  next.onclick = () => {
    if (leaderboardCurrentPage < totalPages) {
      leaderboardCurrentPage++;

      renderLeaderboard();
    }
  };

  pagination.appendChild(next);
}

// Deletes

const deleteModal = document.getElementById("deleteModal");

const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

let expenseIdToDelete = null;

async function deleteExpense(id) {
  expenseIdToDelete = id;

  deleteModal.classList.add("active");

  confirmDeleteBtn.addEventListener("click", async () => {
    if (!expenseIdToDelete) return;

    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        showMessage(result.message || "Failed to delete transaction");

        return;
      }

      deleteModal.classList.remove("active");

      showMessage(result.message || "Transaction deleted successfully!");

      await fetchExpenses();

      if (user && user.isPremium === true) {
        await fetchExpenseHistory();
      }
    } catch (error) {
      console.error("Delete Transaction Error:", error);

      showMessage("Server error. Please try again.");
    }
  });
}

cancelDeleteBtn.addEventListener("click", () => {
  deleteModal.classList.remove("active");
  expenseIdToDelete = null;
});

//edit expense

function editExpense(id) {
  const transaction = expenses.find((expense) => expense.id === id);

  if (!transaction) {
    showMessage("Transaction not found");
    return;
  }

  document.getElementById("amount").value = transaction.amount;

  document.getElementById("description").value = transaction.description || "";

  const noteInput = document.getElementById("note");

  if (noteInput) {
    noteInput.value = transaction.note || "";
  }

  editingExpenseId = id;

  const submitBtn = expenseForm.querySelector('button[type="submit"]');

  if (submitBtn) {
    submitBtn.textContent = "Update Transaction";
  }

  document.getElementById("amount").scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  showMessage("Edit the details and click Update Transaction");
}

//Update expense data

async function updateExpense(data) {
  try {
    if (aiStatus) {
      aiStatus.textContent = "✨ AI Is Categorizing...";
    }

    const response = await fetch(`${API_URL}/expenses/${editingExpenseId}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      if (aiStatus) {
        aiStatus.textContent = "";
      }

      showMessage(result.message || "Failed to update transaction");

      return;
    }

    showMessage(result.message || "Transaction updated successfully!");

    expenseForm.reset();

    if (aiStatus) {
      aiStatus.textContent = "";
    }

    editingExpenseId = null;

    const submitBtn = expenseForm.querySelector('button[type="submit"]');

    if (submitBtn) {
      submitBtn.textContent = "Add";
    }

    await fetchExpenses();

    if (user && user.isPremium === true) {
      await fetchExpenseHistory();
    }
  } catch (error) {
    console.error("Update Transaction Error:", error);

    if (aiStatus) {
      aiStatus.textContent = "";
    }

    showMessage("Server error. Please try again.");
  }
}

// Initializes dark and light theme
function initializeTheme() {
  const themeToggle = document.getElementById("themeToggle");

  if (!themeToggle) {
    return;
  }

  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");

    themeToggle.textContent = "🌙";
  } else {
    themeToggle.textContent = "🌞";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    const isDark = document.body.classList.contains("dark-theme");

    if (isDark) {
      themeToggle.textContent = "🌙";

      localStorage.setItem("theme", "dark");
    } else {
      themeToggle.textContent = "🌞";

      localStorage.setItem("theme", "light");
    }
  });
}

// Handles premium membership payment
async function handlePremiumPayment() {
  const phone = prompt("Enter your 10 digit mobile number");

  if (phone === null) {
    return;
  }

  const cleanPhone = phone.trim();

  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    alert("Please enter a valid 10 digit mobile number");

    return;
  }

  try {
    premiumBtn.disabled = true;

    premiumBtn.innerText = "Processing...";

    const currentToken = localStorage.getItem("token");

    const response = await fetch("/api/payment/create-order", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${currentToken}`,
      },

      body: JSON.stringify({
        phone: cleanPhone,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showMessage(data.message || "Unable to create order");

      premiumBtn.disabled = false;

      premiumBtn.innerText = "💎 Buy Premium Membership";

      return;
    }

    await cashfree.checkout({
      paymentSessionId: data.paymentSessionId,

      redirectTarget: "_self",
    });
  } catch (error) {
    console.error("Payment Error:", error);

    showMessage("Something went wrong. Please try again.");

    premiumBtn.disabled = false;

    premiumBtn.innerText = "💎 Buy Premium Membership";
  }
}

// Verifies Cashfree payment
async function verifyPayment(orderId) {
  try {
    const currentToken = localStorage.getItem("token");

    const response = await fetch(`/api/payment/verify/${orderId}`, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.status === "SUCCESSFUL") {
      showMessage("Transaction successful");

      const currentUser = JSON.parse(localStorage.getItem("user") || "null");

      if (currentUser) {
        currentUser.isPremium = true;

        localStorage.setItem("user", JSON.stringify(currentUser));
      }

      setPremiumBtn();

      if (boardBtn) {
        boardBtn.style.display = "flex";
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (data.status === "FAILED") {
      showMessage("TRANSACTION FAILED.");

      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      showMessage(data.message || "Unable to verify transaction.");
    }
  } catch (error) {
    console.error("Verification Error:", error);

    showMessage("Unable to verify transaction.");
  }
}

// Opens leaderboard for premium users
async function openLeaderboard() {
  if (!user || user.isPremium !== true) {
    return;
  }

  if (leaderboardOverlay) {
    leaderboardOverlay.classList.add("active");
  }

  leaderboardCurrentPage = 1;

  if (historyFilter) {
    historyFilter.value = "all";
  }

  await fetchExpenseHistory();
}

// Closes leaderboard panel
function closeLeaderboardPanel() {
  if (leaderboardOverlay) {
    leaderboardOverlay.classList.remove("active");
  }
}

// Handles history filter changes
function handleHistoryFilter() {
  leaderboardCurrentPage = 1;

  renderLeaderboard();
}

// Closes leaderboard when clicked outside
function handleLeaderboardOutsideClick(event) {
  if (event.target === leaderboardOverlay) {
    leaderboardOverlay.classList.remove("active");
  }
}

// Formats transaction date
function formatLeaderboardDate(date) {
  if (!date) {
    return "";
  }

  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "";
  }

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Escapes HTML content safely
function escapeHTML(value) {
  const div = document.createElement("div");

  div.textContent = value ?? "";

  return div.innerHTML;
}

// Initializes the dashboard
async function initializeDashboard() {
  checkPremiumStatus();

  initializeTheme();

  await fetchExpenses();

  if (user && user.isPremium === true) {
    await fetchExpenseHistory();
  }
}

// Handles user logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "login.html";
  });
}

// Handles expense form submission
if (expenseForm) {
  expenseForm.addEventListener("submit", addTransaction);
}

// Handles premium payment button
if (premiumBtn) {
  premiumBtn.addEventListener("click", handlePremiumPayment);
}

// Handles leaderboard button click
if (boardBtn && user && user.isPremium === true) {
  boardBtn.addEventListener("click", openLeaderboard);
}

// Handles leaderboard close button
if (closeLeaderboard) {
  closeLeaderboard.addEventListener("click", closeLeaderboardPanel);
}

// Handles leaderboard outside click
if (leaderboardOverlay) {
  leaderboardOverlay.addEventListener("click", handleLeaderboardOutsideClick);
}

// Handles history filter change
if (historyFilter) {
  historyFilter.addEventListener("change", handleHistoryFilter);
}

checkPremiumStatus();

initializeDashboard();

const urlParams = new URLSearchParams(window.location.search);

const orderId = urlParams.get("order_id");

if (orderId) {
  verifyPayment(orderId);
}
