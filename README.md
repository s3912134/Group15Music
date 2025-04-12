# 🎵 Group 15 Music App

A modern, full-stack music subscription web application built using **React**, **AWS Lambda**, **DynamoDB**, and **Vite**.

---

## 📁 Project Structure

```
frontend/
├── public/                 # Static files
├── src/
│   ├── assets/             # Static assets like images and animations
│   ├── pages/              # Main app pages (Login, Dashboard)
│   ├── style/              # CSS styles
│   ├── App.jsx             # Main routing and layout
│   ├── main.jsx            # Entry point
├── package.json
├── vite.config.js
```

---

## 🚀 Features

- 🔐 **User Authentication**

  - Register / Login using AWS Lambda
  - Session persistence using localStorage

- 🎵 **Music Subscription**

  - View, subscribe, and unsubscribe to music from a list
  - Search music by title, artist, album, or year

- 💾 **AWS Backend**

  - Music and subscription data stored in DynamoDB
  - All interactions via Lambda functions

- 💡 **Nice UI**
  - Lottie animations, toast notifications
  - Responsive layout with Tailwind-style utility classes

---

## ⚙️ Technologies Used

- **Frontend:** React + Vite
- **Backend:** AWS Lambda (Python), DynamoDB, API Gateway
- **UI:** Tailwind CSS style (manual), Lottie, react-toastify
- **Hosting:** Run locally with Vite (`npm run dev`)

---

## 🧪 How to Run

1. Clone the repository

```bash
git clone https://github.com/your-username/group15music.git
cd group15music/frontend
```

2. Install dependencies

```bash
npm install
```

3. Run the dev server

```bash
npm run dev
```

4. Visit `http://localhost:5173`

---

## 🗓️ Last Updated

April 12, 2025

---

## 👨‍💻 Author

Group 15 (Developed by Group 15 members)
