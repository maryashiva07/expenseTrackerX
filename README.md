# 💰 Expense Tracker

A full-stack **Expense Tracker web application** designed to help users manage, organize, and monitor their daily expenses efficiently.

The application provides secure authentication, complete expense management, **AI-powered expense categorization**, Redis caching, premium membership features, Cashfree payment integration, password reset functionality, expense history, and dark/light theme support.

---

## 🚀 Features

### 🔐 Authentication & Security

The application provides a secure authentication system with:

* 👤 User Signup
* 🔑 User Login
* 🛡️ JWT-based Authentication
* 🔒 Password Hashing using `bcrypt`
* 🔐 Protected Routes
* 📧 Forgot Password functionality
* 🔄 Password Reset functionality

User authentication ensures that personal expense data remains protected and accessible only to authorized users.

---

### 💸 Expense Management

Users can easily manage their daily expenses through a simple and intuitive interface.

#### Users can:

* ➕ Add new expenses
* 👀 View all expenses
* ✏️ Edit existing expenses
* 🗑️ Delete expenses
* 📝 Add notes to expenses
* 🤖 Automatically categorize expenses using AI

Each expense contains the following information:

| Field          | Description                              |
| -------------- | ---------------------------------------- |
| 💵 Amount      | Amount spent                             |
| 📝 Description | Description of the expense               |
| 🏷️ Category   | Automatically generated expense category |
| 📌 Note        | Additional information about the expense |
| 📅 Date        | Date of the transaction                  |

---

## 🤖 AI-Powered Expense Categorization

The application uses **Google Gemini AI** to automatically categorize expenses based on their descriptions.

For example:

```text
Description: Pizza from Domino's
Category: Food
```

Instead of manually selecting a category, users can simply enter a description and the application uses AI to determine the most appropriate category.

### Benefits

* ⚡ Automatic categorization
* 🎯 More convenient expense entry
* 🤖 AI-powered classification
* 🔄 Categories are regenerated when an expense description is changed

---

## ⚡ Redis Caching

**Redis** is used as a caching layer to improve application performance and reduce unnecessary database queries and external API calls.

### Cached Data

* 💸 User expenses
* 🤖 AI-generated expense categories

Caching frequently accessed data helps improve response times and reduces the load on the MySQL database and AI services.

### Cache Management

When an expense is deleted or modified, the relevant Redis cache is cleared so that updated data can be fetched from the database.

---

## 👑 Premium Membership

The application includes a **Premium Membership** system that provides users with access to additional features.

### Premium Features

* 👑 Premium membership access
* 🏆 Leaderboard access
* 📜 Expense history
* 📊 Additional premium functionality

The premium system allows the application to provide enhanced features while maintaining a separate experience for regular and premium users.

---

## 💳 Payment Gateway Integration

**Cashfree Payment Gateway** is integrated to securely handle premium membership purchases.

### Payment Features

* 🧾 Create payment orders
* 💳 Process premium membership payments
* ✅ Verify payments
* 👑 Activate premium membership after successful payment
* 📋 Manage order status

The payment workflow ensures that premium access is granted only after successful payment verification.

---

## 📊 Expense History

The application stores historical expense information so users can maintain a record of their previous transactions.

Premium users can:

* 📜 View previous transactions
* 📊 Track historical spending
* 💾 Maintain long-term expense records
* 🔎 Review past financial activity

This helps users better understand and monitor their spending over time.

---

## ✏️ Edit Expenses

Users can edit their existing expenses directly using the same expense input form.

### Editable Fields

* 💵 Amount
* 📝 Description
* 📌 Note

When the description is changed, the application automatically generates the expense category again using **Google Gemini AI**.

This ensures that the category remains relevant to the updated description.

---

## 🗑️ Delete Expenses

Users can permanently delete unwanted transactions.

When an expense is deleted:

1. 🗑️ The expense is removed from the database.
2. ⚡ The corresponding Redis cache is cleared.
3. 🔄 Updated expense data is fetched.
4. 🖥️ The user interface is updated with the latest information.

This keeps the database and cached data synchronized.

---

## 🌙 Dark & Light Theme

The application supports both **Light Mode** and **Dark Mode**, allowing users to choose their preferred interface.

### Available Themes

* ☀️ **Light Mode**
* 🌙 **Dark Mode**

The theme system provides a more comfortable and personalized user experience.

---

# 🛠️ Tech Stack

## 🎨 Frontend

* HTML
* CSS
* JavaScript

## ⚙️ Backend

* Node.js
* Express.js

## 🗄️ Database

* MySQL
* Sequelize ORM

## 🔐 Authentication & Security

* JWT
* bcrypt

## ⚡ Caching

* Redis

## 🤖 AI Integration

* Google Gemini AI

## 💳 Payment Gateway

* Cashfree Payment Gateway

## 🐳 DevOps & Deployment

* Docker
* Docker Compose
* Render

---

# 🏗️ Application Architecture

The application follows a full-stack architecture where the frontend communicates with the Node.js/Express.js backend.

```text
                ┌─────────────────────┐
                │      Frontend       │
                │   HTML / CSS / JS   │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │    Express.js API   │
                │      Backend        │
                └──────┬──────┬───────┘
                       │      │
             ┌─────────┘      └──────────┐
             ▼                           ▼
      ┌──────────────┐            ┌──────────────┐
      │    MySQL     │            │    Redis     │
      │   Database   │            │    Cache     │
      └──────────────┘            └──────────────┘
             │
             │
      ┌──────┴───────────┐
      ▼                  ▼
┌──────────────┐  ┌───────────────┐
│ Gemini AI    │  │    Cashfree   │
│ Categorizer  │  │    Payments   │
└──────────────┘  └───────────────┘
```

---

# 🔄 Expense Workflow

The general expense workflow works as follows:

```text
User enters expense
        │
        ▼
Backend receives request
        │
        ▼
Gemini AI categorizes expense
        │
        ▼
Expense saved in MySQL
        │
        ▼
Expense data cached in Redis
        │
        ▼
Expense displayed to user
```

When an expense is updated:

```text
User edits expense
        │
        ▼
Description updated?
        │
        ▼
Gemini AI generates category again
        │
        ▼
Updated expense saved
        │
        ▼
Redis cache invalidated
        │
        ▼
Latest expense data fetched
```

---

# 💳 Premium Payment Workflow

```text
User selects Premium Membership
             │
             ▼
      Create Cashfree Order
             │
             ▼
       User completes payment
             │
             ▼
       Verify payment status
             │
             ▼
       Payment successful?
          /        \
        Yes         No
         │           │
         ▼           ▼
Activate Premium   Order Failed
         │
         ▼
 Premium Features Enabled
```

---

# 🐳 Docker Support

The application supports **Docker and Docker Compose**, making it easier to configure and run the application consistently across different environments.

Docker can be used to manage services such as:

* Node.js application
* MySQL database
* Redis cache

This simplifies local development and deployment.

---

# ☁️ Deployment

The application can be deployed using **Render**.

Docker support makes the deployment process easier by providing a consistent application environment across development and production.

---

# 🔮 Future Improvements

The project can be further enhanced with additional financial management and analytics features.

Planned improvements include:

* 📈 Advanced expense analytics
* 📊 Monthly spending charts
* 📥 Downloadable expense reports
* ☁️ Cloud file storage
* 📧 Email notifications
* 📱 Progressive Web App (PWA) support
* 🔔 Budget alerts
* 📅 Monthly and yearly financial reports
* 📊 Advanced spending insights
* 🎯 Personalized budget recommendations

---

# 👨‍💻 Author

**Shiva Marya**

*Full Stack Developer*

---

# ⭐ Support

If you find this project useful or interesting, please consider giving the repository a ⭐ on GitHub.

Your support is greatly appreciated! ❤️

---
