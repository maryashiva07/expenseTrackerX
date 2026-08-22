const API_URL = "/api";

const cashfree = Cashfree({
    mode: "sandbox"
});


// AUTH

const token = localStorage.getItem("token");

const user = JSON.parse(
    localStorage.getItem("user") || "null"
);

if (!token) {
    window.location.href = "login.html";
}


// DOM

const expenseForm =
    document.getElementById("expenseForm");

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

const premiumBtn =
    document.getElementById("premiumBtn");


// USER INFO

if (user) {

    username.textContent =
        user.name || "User";

    userEmail.textContent =
        user.email || "";

}


// PREMIUM BUTTON

function setPremiumBtn() {

    if (!premiumBtn) return;

    premiumBtn.textContent =
        "👑 Premium Member";

    premiumBtn.disabled = true;

    premiumBtn.style.opacity = "0.7";

    premiumBtn.style.cursor = "not-allowed";
}


// Restore premium status

if (
    user &&
    user.isPremium === true
) {

    setPremiumBtn();

}


// LOGOUT

logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "login.html";

});


// ADD EXPENSE

expenseForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const data = {

            amount:
                Number(
                    document.getElementById(
                        "amount"
                    ).value
                ),

            description:
                document.getElementById(
                    "description"
                ).value,

            category:
                document.getElementById(
                    "category"
                ).value

        };


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

                    body:
                        JSON.stringify(data)

                }
            );


            const result =
                await response.json();


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


            expenseForm.reset();

            fetchExpenses();

        }

        catch (error) {

            console.error(error);

            alert(
                "Server error. Please try again."
            );

        }

    }
);


// GET EXPENSES

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


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.message ||
                "Failed to fetch expenses"
            );

            return;
        }


        const expenses =
            result.expenses || result;


        displayExpenses(expenses);

    }

    catch (error) {

        console.error(error);

    }

}


// DISPLAY EXPENSES

function displayExpenses(expenses) {

    expenseTableBody.innerHTML = "";


    if (
        !expenses ||
        expenses.length === 0
    ) {

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


    expenses.forEach(
        (expense, index) => {

            total +=
                Number(expense.amount);


            const row =
                document.createElement("tr");


            const date =
                new Date(
                    expense.createdAt
                );


            const month =
                date.getMonth() + 1 <= 9
                    ? "0" +
                      (date.getMonth() + 1)
                    : date.getMonth() + 1;


            const newDate =
                date.getDate() +
                "/" +
                month +
                "/" +
                date.getFullYear();


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
                    ${newDate}
                </td>

                <td>
                    ₹${Number(
                        expense.amount
                    ).toFixed(2)}
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

        }
    );


    totalExpense.textContent =
        total.toFixed(2);


    expenseCount.textContent =
        `${expenses.length} ${
            expenses.length === 1
                ? "expense"
                : "expenses"
        }`;

}


// DELETE EXPENSE

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


        fetchExpenses();

    }

    catch (error) {

        console.error(error);

        alert(
            "Server error. Please try again."
        );

    }

}


// THEME

const themeToggle =
    document.getElementById(
        "themeToggle"
    );


const savedTheme =
    localStorage.getItem("theme");


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark-theme"
    );

    themeToggle.textContent = "🌙";

}

else {

    themeToggle.textContent = "🌞";

}


themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark-theme"
        );


        const isDark =
            document.body.classList.contains(
                "dark-theme"
            );


        if (isDark) {

            themeToggle.textContent =
                "🌙";

            localStorage.setItem(
                "theme",
                "dark"
            );

        }

        else {

            themeToggle.textContent =
                "🌞";

            localStorage.setItem(
                "theme",
                "light"
            );

        }

    }
);


// PAYMENT

premiumBtn.addEventListener(
    "click",
    async () => {

        const phone =
            prompt(
                "Enter your 10 digit mobile number"
            );


        if (phone === null) {
            return;
        }


        const cleanPhone =
            phone.trim();


        if (
            !/^[6-9]\d{9}$/.test(
                cleanPhone
            )
        ) {

            alert(
                "Please enter a valid 10 digit mobile number"
            );

            return;
        }


        try {

            premiumBtn.disabled = true;

            premiumBtn.innerText =
                "Processing...";


            const currentToken =
                localStorage.getItem(
                    "token"
                );


            const response =
                await fetch(
                    "/api/payment/create-order",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${currentToken}`

                        },

                        body:
                            JSON.stringify({
                                phone:
                                    cleanPhone
                            })

                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    data.message ||
                    "Unable to create order"
                );


                premiumBtn.disabled =
                    false;

                premiumBtn.innerText =
                    "💎 Buy Premium Membership";

                return;
            }


            await cashfree.checkout({

                paymentSessionId:
                    data.paymentSessionId,

                redirectTarget:
                    "_self"

            });

        }

        catch (error) {

            console.log(
                "Payment Error:",
                error
            );


            alert(
                "Something went wrong. Please try again."
            );


            premiumBtn.disabled =
                false;

            premiumBtn.innerText =
                "💎 Buy Premium Membership";

        }

    }
);


// PAYMENT VERIFICATION

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const orderId =
    urlParams.get("order_id");


console.log(
    "ORDER ID FROM URL:",
    orderId
);


if (orderId) {

    const verifyPayment =
        async () => {

            try {

                const currentToken =
                    localStorage.getItem(
                        "token"
                    );


                console.log(
                    "Calling payment verification..."
                );


                const response =
                    await fetch(
                        `/api/payment/verify/${orderId}`,
                        {

                            method: "GET",

                            headers: {

                                "Authorization":
                                    `Bearer ${currentToken}`

                            }

                        }
                    );


                console.log(
                    "Verification HTTP Status:",
                    response.status
                );


                const data =
                    await response.json();


                console.log(
                    "Verification Response:",
                    data
                );


                if (
                    response.ok &&
                    data.status ===
                        "SUCCESSFUL"
                ) {

                    alert(
                        "Transaction successful"
                    );


                    const currentUser =
                        JSON.parse(
                            localStorage.getItem(
                                "user"
                            ) || "null"
                        );


                    if (currentUser) {

                        currentUser.isPremium =
                            true;


                        localStorage.setItem(
                            "user",
                            JSON.stringify(
                                currentUser
                            )
                        );

                    }


                    setPremiumBtn();


                    window.history.replaceState(
                        {},
                        document.title,
                        window.location.pathname
                    );

                }

                else if (
                    data.status === "FAILED"
                ) {

                    alert(
                        "TRANSACTION FAILED."
                    );


                    window.history.replaceState(
                        {},
                        document.title,
                        window.location.pathname
                    );

                }

                else {

                    alert(
                        data.message ||
                        "Unable to verify transaction."
                    );

                }

            }

            catch (error) {

                console.error(
                    "Verification Error:",
                    error
                );

                alert(
                    "Unable to verify transaction."
                );

            }

        };


    verifyPayment();

}


// INITIAL LOAD

fetchExpenses();