const API_URL = "/api";


// ========================================
// AUTHENTICATION
// ========================================

const token = localStorage.getItem("token");

const user = JSON.parse(
    localStorage.getItem("user") || "null"
);


// If user is not logged in
if (!token) {

    window.location.href = "login.html";

}


// ========================================
// DOM ELEMENTS
// ========================================

const expenseForm = document.getElementById("expenseForm");

const expenseTableBody =
    document.getElementById("expenseTableBody");

const totalExpense =
    document.getElementById("totalExpense");

const expenseCount =
    document.getElementById("expenseCount");

const username =
    document.getElementById("username");

const userEmail =
    document.getElementById("userEmail");

const logoutBtn =
    document.getElementById("logoutBtn");


// ========================================
// SHOW USER INFORMATION
// ========================================

if (user) {

    username.textContent = user.name || "User";

    userEmail.textContent = user.email || "";

}


// ========================================
// LOGOUT
// ========================================

logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "login.html";

});


// ========================================
// ADD EXPENSE
// ========================================

expenseForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const data = {

        amount:
            Number(document.getElementById("amount").value),

        description:
            document.getElementById("description").value,

        category:
            document.getElementById("category").value

    };


    console.log("Expense:", data);


    try {

        const response = await fetch(
            `${API_URL}/expenses`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`

                },

                body: JSON.stringify(data)

            }
        );


        const result = await response.json();


        console.log("Backend:", result);


        if (!response.ok) {

            alert(
                result.message ||
                "Failed to add expense"
            );

            return;
        }


        alert(
            result.message ||
            "Expense added successfully!"
        );


        // Clear form
        expenseForm.reset();


        // Fetch updated expenses
        fetchExpenses();

    }

    catch (error) {

        console.error(error);

        alert("Server error. Please try again.");

    }

});


// ========================================
// GET ALL EXPENSES
// ========================================

async function fetchExpenses() {

    try {

        const response = await fetch(
            `${API_URL}/expenses`,
            {

                method: "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        );


        const result = await response.json();


        console.log("Expenses:", result);


        if (!response.ok) {

            alert(
                result.message ||
                "Failed to fetch expenses"
            );

            return;
        }


        /*
            Depending on your backend response,
            expenses may be inside result.expenses.
        */

        const expenses =
            result.expenses || result;


        displayExpenses(expenses);

    }

    catch (error) {

        console.error(error);

    }

}


// ========================================
// DISPLAY EXPENSES
// ========================================

function displayExpenses(expenses) {

    expenseTableBody.innerHTML = "";


    // No expenses
    if (!expenses || expenses.length === 0) {

        expenseTableBody.innerHTML = `

            <tr class="empty-row">

                <td colspan="6">

                    <div class="empty-state">

                        <div class="empty-icon">
                            ₹
                        </div>

                        <h4>
                            No expenses yet
                        </h4>

                        <p>
                            Add your first expense
                            using the form above.
                        </p>

                    </div>

                </td>

            </tr>

        `;

        totalExpense.textContent = "0";

        expenseCount.textContent =
            "0 expenses";

        return;
    }


    let total = 0;


    expenses.forEach((expense, index) => {

        total += Number(expense.amount);


        const row =
            document.createElement("tr");


        /*
            Convert database date
            into readable date.
        */

        const date =
            expense.createdAt
                ? new Date(
                    expense.createdAt
                ).toLocaleDateString()
                : "-";


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                ${expense.description}
            </td>

            <td>
                ${expense.category}
            </td>

            <td>
                ${date}
            </td>

            <td>
                ₹${Number(expense.amount).toFixed(2)}
            </td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteExpense(${expense.id})"
                >
                    Delete
                </button>

            </td>

        `;


        expenseTableBody.appendChild(row);

    });


    // Update total
    totalExpense.textContent =
        total.toFixed(2);


    // Update count
    expenseCount.textContent =
        `${expenses.length} ${
            expenses.length === 1
                ? "expense"
                : "expenses"
        }`;

}


// ========================================
// DELETE EXPENSE
// ========================================

async function deleteExpense(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/expenses/${id}`,
            {

                method: "DELETE",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        );


        const result =
            await response.json();


        console.log(result);


        if (!response.ok) {

            alert(
                result.message ||
                "Failed to delete expense"
            );

            return;
        }


        alert(
            result.message ||
            "Expense deleted successfully!"
        );


        // Refresh table
        fetchExpenses();

    }

    catch (error) {

        console.error(error);

        alert(
            "Server error. Please try again."
        );

    }

}


// ========================================
// FETCH EXPENSES WHEN PAGE LOADS
// ========================================

fetchExpenses();