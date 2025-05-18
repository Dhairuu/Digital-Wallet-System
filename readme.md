# Digital Wallet System – Server

This is the backend server for the Digital Wallet System — a secure, scalable platform to manage digital transactions like deposits, withdrawals, and transfers. It also handles user authentication and wallet management via RESTful APIs.

## ✨ Features

- 🔐 User registration & login with JWT authentication
- 💳 Wallet creation and real-time balance updates
- 💸 Transaction operations: deposit, withdraw, and transfer
- 📡 RESTful APIs for frontend integration
- 🔒 Secure password storage with bcrypt

## 🛠️ Tech Stack

- **Node.js** – Server runtime
- **Express.js** – Web framework
- **MongoDB** – NoSQL database
- **Mongoose** – MongoDB ODM
- **JWT** – Authentication tokens
- **bcrypt** – Password hashing

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)

### Installation

```bash
git clone https://github.com/Dhairuu/Digital-Wallet-System.git
cd Digital-Wallet-System/server
npm install


### Project Structure

server/
├── controllers/       # Logic for each route
├── models/            # Mongoose schemas
├── routes/            # API routes
├── middleware/        # JWT auth middleware
├── config/            # MongoDB connection config
├── app.js             # Entry point
├── .env               # Environment variables
└── package.json       # Dependencies
