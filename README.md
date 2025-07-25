# 🧠 BrainBoost App

A fun and educational React Native app built with Expo, designed to sharpen your brain through daily challenges, puzzles, and word games.

---

## 🚀 Features

* 🧩 Mini Games: Math, memory, logic, reaction
* 📅 Daily XP and Streak Tracker
* 🏆 Leaderboard & Profile Stats
* 🔠 Word-based games (Hangman, Word Builder, Guess the Word)
* 🔊 Fun Sound Effects
* 🎉 Confetti and Lottie animations

---

## 📁 Folder Structure (Recommended)

```
BrainBoost/
│
├── app/                # App routing (expo-router)
│   └── (tabs)/         # Tab screens like Home, Explore
│
├── assets/             # Images, fonts, Lottie files
├── components/         # Reusable UI components
├── constants/          # Colors, strings, game configs
├── hooks/              # Custom hooks
├── scripts/            # Firebase setup, utility logic
│
├── App.tsx             # Entry point
├── app.json            # App config for Expo
├── README.md           # This file
└── tsconfig.json       # TypeScript config
```

---

## 🛠 Setup Instructions

### 1. Create Expo App

```bash
npx create-expo-app BrainBoost
cd BrainBoost
```

### 2. Install Dependencies

```bash
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated
npm install @react-navigation/bottom-tabs
npx expo install @react-native-async-storage/async-storage
npx expo install expo-av
npx expo install lottie-react-native
```

### 3. Firebase Setup (Optional but Recommended)

```bash
npm install firebase
```

Configure in `scripts/firebase.js`.

### 4. EAS Setup for OTA and Builds

```bash
npm install -g expo
npx expo login
npx eas init
npx eas update --branch main
npx eas build:configure
npx eas build -p android --profile production
```

---

## 🔁 Version Control (Git + GitHub)

```bash
git init
git add .
git commit -m "Initial Commit"
gh repo create BrainBoost --public --source=. --remote=origin
git push -u origin main
```

---

## 📦 Future Enhancements

* 🔐 Firebase Auth (Google, Email)
* 🌐 Realtime multiplayer games
* 🌙 Dark mode / Accessibility
* 📈 Game analytics and performance tracking

---

## 👨‍💻 Contributing

Pull requests welcome! For major changes, please open an issue first.

---

## 📄 License

[MIT](LICENSE)

---

> Built with ❤️ using Expo + React Native
# BrainBoost
