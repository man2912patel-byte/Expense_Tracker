let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let monthlyBudgets = JSON.parse(localStorage.getItem("monthlyBudgets")) || {};

const currentDate = new Date();

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentMonthKey = `${monthNames[currentDate.getMonth()]}-${currentDate.getFullYear()}`;

const loginScreen = document.getElementById("loginScreen");
const mainApp = document.getElementById("mainApp");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const skipLoginBtn = document.getElementById("skipLoginBtn");
const userInfo = document.getElementById("userInfo");

function saveData() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("monthlyBudgets", JSON.stringify(monthlyBudgets));
}

function openApp() {
  loginScreen.style.display = "none";
  mainApp.style.display = "block";
}

function showUser() {
  const savedUser = localStorage.getItem("loggedInUser");

  if (savedUser) {
    userInfo.innerText = `Hello, ${savedUser}`;
  } else {
    userInfo.innerText = "Guest User";
  }
}

googleLoginBtn.addEventListener("click", () => {
  const name = prompt("Enter your Google name");

  if (name) {
    localStorage.setItem("loggedInUser", name);
    localStorage.setItem("permanentStorage", "true");
    showUser();
    openApp();
  }
});

skipLoginBtn.addEventListener("click", () => {
  localStorage.setItem("guestMode", "true");

  const today = new Date().toDateString();
  localStorage.setItem("guestDate", today);

  showUser();
  openApp();
});

function updateMonthOptions() {
  const monthFilter = document.getElementById("monthFilter");
  monthFilter.innerHTML = "";

  const months = [...new Set(expenses.map(exp => exp.monthKey))];

  if (!months.includes(currentMonthKey)) {
    months.push(currentMonthKey);
  }

  months.sort().reverse();

  months.forEach(month => {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = month;
    monthFilter.appendChild(option);
  });

  monthFilter.value = currentMonthKey;
}

function displayExpenses() {
  const selectedMonth = document.getElementById("monthFilter").value;
  const expenseList = document.getElementById("expenseList");

  expenseList.innerHTML = "";

  const filteredExpenses = expenses.filter(exp => exp.monthKey === selectedMonth);

  let totalSpent = 0;

  filteredExpenses.forEach((exp, index) => {
    totalSpent += exp.amount;

    expenseList.innerHTML += `
      <div class="expense-item">
        <div>
          <strong>${exp.itemName}</strong><br>
          ${exp.day} | ${exp.dateTime}
        </div>

        <div>
          ₹${exp.amount}

          <div class="action-buttons">
            <button class="edit-btn" onclick="editExpense(${index})">Edit</button>
            <button class="delete-btn" onclick="deleteExpense(${index})">Delete</button>
          </div>
        </div>
      </div>
    `;
  });

  const budget = monthlyBudgets[selectedMonth] || 0;
  const remainingBudget = budget - totalSpent;
  const budgetUsed = budget > 0 ? ((totalSpent / budget) * 100).toFixed(2) : 0;

  document.getElementById("budgetText").innerText = "₹" + budget;
  document.getElementById("spentText").innerText = "₹" + totalSpent;
  document.getElementById("remainingText").innerText = "₹" + remainingBudget;
  document.getElementById("usedText").innerText = budgetUsed + "%";

  const alertBox = document.getElementById("alertBox");

  if (budgetUsed >= 70) {
    alertBox.innerText = "🔴 RED ALERT: More than 70% budget used";
    alertBox.style.background = "#fecaca";
  } else if (budgetUsed >= 50) {
    alertBox.innerText = "🟡 YELLOW ALERT: More than 50% budget used";
    alertBox.style.background = "#fde68a";
  } else if (budgetUsed >= 30) {
    alertBox.innerText = "🟢 GREEN ALERT: More than 30% budget used";
    alertBox.style.background = "#bbf7d0";
  } else {
    alertBox.innerText = "Budget is under control";
    alertBox.style.background = "#bfdbfe";
  }
}

document.getElementById("monthlyBudget").addEventListener("change", function () {
  const newBudget = Number(this.value);

  if (!newBudget || newBudget <= 0) {
    alert("Budget must be greater than 0");
    this.value = monthlyBudgets[currentMonthKey] || "";
    return;
  }

  const confirmReset = confirm(
    "Changing monthly budget will clear current month expense history. Do you want to continue?"
  );

  if (confirmReset) {
    expenses = expenses.filter(exp => exp.monthKey !== currentMonthKey);
    monthlyBudgets[currentMonthKey] = newBudget;

    saveData();
    updateMonthOptions();
    displayExpenses();
  } else {
    this.value = monthlyBudgets[currentMonthKey] || "";
  }
});

function addExpense() {
  const budget = Number(document.getElementById("monthlyBudget").value);
  let itemName = document.getElementById("itemName").value.trim();
  itemName = itemName.charAt(0).toUpperCase() + itemName.slice(1).toLowerCase();
  const amount = Number(document.getElementById("amount").value);

  if (!budget || budget <= 0 || !itemName || !amount || amount <= 0) {
    alert("Please enter valid details. Amount and Budget must be greater than 0");
    return;
  }

  monthlyBudgets[currentMonthKey] = budget;

  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const dateTime = now.toLocaleString();

  expenses.push({
    itemName,
    amount,
    day,
    dateTime,
    monthKey: currentMonthKey
  });

  saveData();
  updateMonthOptions();
  displayExpenses();

  document.getElementById("itemName").value = "";
  document.getElementById("amount").value = "";
}

function deleteExpense(index) {
  const selectedMonth = document.getElementById("monthFilter").value;

  const filteredExpenses = expenses.filter(exp => exp.monthKey === selectedMonth);
  const expenseToDelete = filteredExpenses[index];

  expenses = expenses.filter(exp => exp !== expenseToDelete);

  saveData();
  updateMonthOptions();
  displayExpenses();
}

function editExpense(index) {
  const selectedMonth = document.getElementById("monthFilter").value;

  const filteredExpenses = expenses.filter(exp => exp.monthKey === selectedMonth);
  const expenseToEdit = filteredExpenses[index];

  const newItemName = prompt("Edit item name:", expenseToEdit.itemName);
  const newAmount = Number(prompt("Edit amount:", expenseToEdit.amount));

  if (!newItemName || newAmount <= 0) {
    alert("Amount must be greater than 0");
    return;
  }

  expenseToEdit.itemName =
    newItemName.charAt(0).toUpperCase() + newItemName.slice(1).toLowerCase();
  expenseToEdit.amount = newAmount;

  saveData();
  displayExpenses();
}

window.onload = function () {
  const savedUser = localStorage.getItem("loggedInUser");
  const guestMode = localStorage.getItem("guestMode");
  const guestDate = localStorage.getItem("guestDate");
  const today = new Date().toDateString();

  if (guestMode && guestDate !== today) {
    localStorage.removeItem("expenses");
    localStorage.removeItem("monthlyBudgets");
    localStorage.removeItem("guestMode");
    localStorage.removeItem("guestDate");

    expenses = [];
    monthlyBudgets = {};
  }

  if (savedUser || guestMode) {
    showUser();
    openApp();
  }

  if (monthlyBudgets[currentMonthKey]) {
    document.getElementById("monthlyBudget").value = monthlyBudgets[currentMonthKey];
  } else {
    document.getElementById("monthlyBudget").value = "";
  }

  updateMonthOptions();
  displayExpenses();
};