# Monthly Budget Planner

A comprehensive React Native app for Android that helps you track and manage your monthly budget across different categories.

## 🚀 Features

Fix-Finance App
 
   npm start -- --tunnel
 
   npm start -- --reset-cache
 
### Budget Categories

- **Gold** - Track gold investments
- **Stock** - Monitor stock market investments
- **SIP** - Systematic Investment Plan tracking
- **Petrol** - Fuel expenses
- **Room Rent** - Housing costs
- **Groceries** - Food and household items
- **Food** - Dining and takeout expenses
- **Shopping** - General shopping expenses
- **Skin Care** - Personal care products
- **Trip** - Travel and vacation expenses
- **Movie** - Entertainment expenses
- **Unknown Expenses** - Miscellaneous spending

### Core Features

- ✅ Set monthly budget limits for each category
- ✅ Track spending in each category with detailed transactions
- ✅ **Automatic SMS-based expense tracking** - Read SMS and automatically extract expenses/income
- ✅ Visual progress bars showing spent vs. limit for each category
- ✅ Remaining balance management
- ✅ Carry over balance to next month
- ✅ Allocate remaining funds to savings/investments
- ✅ Monthly budget reset functionality
- ✅ Dark theme with orange accents
- ✅ Local data storage using AsyncStorage

## 📱 Screenshots

The app features a modern, clean interface with:

- **Dashboard**: Overview of budget status, quick actions, and top categories
- **Categories**: Detailed view of all budget categories with progress tracking
- **Add Transaction**: Easy transaction entry with category selection

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Android Studio (for Android development)
- Android device or emulator

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd MonthlyBudgetPlanner
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on Android**

   ```bash
   npm run android
   ```

### Alternative: Using Expo Go

1. Install Expo Go on your Android device
2. Run `npm start` and scan the QR code with Expo Go

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── constants/           # App constants and configurations
│   └── categories.ts   # Budget category definitions
├── context/            # React Context for state management
│   └── BudgetContext.tsx
├── navigation/         # Navigation configuration
│   ├── MainNavigator.tsx
│   └── types.ts
├── reducers/           # State management reducers
│   └── budgetReducer.ts
├── screens/            # App screens
│   ├── DashboardScreen.tsx
│   ├── CategoriesScreen.tsx
│   └── AddTransactionScreen.tsx
├── theme/              # UI theme configuration
│   └── index.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── utils/              # Utility functions
    └── storage.ts      # AsyncStorage utilities
```

## 🎨 Design System

### Theme

- **Primary Color**: Orange (#FF6B35)
- **Background**: Dark (#000000)
- **Surface**: Dark Gray (#1E1E1E)
- **Text**: White (#FFFFFF)
- **Accent**: Orange variants for highlights

### Components

- Built with React Native Paper
- Consistent dark theme throughout
- Modern, minimal UI design
- Responsive layout for different screen sizes

## 💾 Data Storage

The app uses AsyncStorage for local data persistence:

- Budget data is automatically saved
- Transactions are stored locally
- Settings and preferences are preserved
- No backend required

## 🔧 Development

### Key Technologies

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for routing
- **React Native Paper** for UI components
- **AsyncStorage** for data persistence

### State Management

- React Context with useReducer
- Centralized budget state management
- Automatic data persistence
- Type-safe actions and state

## 📊 Usage Guide

### Setting Up Your Budget

1. Navigate to the "Categories" tab
2. Tap "Edit" on any category
3. Set your monthly budget limit
4. Repeat for all categories

### Adding Transactions

1. Tap the "+" button on the dashboard
2. Select transaction type (Income/Expense)
3. Enter amount and description
4. Choose category
5. Tap "Add Transaction"

### Monitoring Progress

- View overall budget progress on dashboard
- Check individual category progress
- See remaining balance for each category
- Track top spending categories

### Managing Remaining Balance

- Carry over to next month
- Allocate to savings/investments
- Reset monthly budget when needed

## 🚀 Deployment

### Building for Production

```bash
# Build Android APK
expo build:android

# Or build with EAS
eas build --platform android
```

### Publishing to Google Play Store

1. Create a Google Play Console account
2. Build production APK/AAB
3. Upload to Google Play Console
4. Follow Google's publishing guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the existing issues
2. Create a new issue with detailed description
3. Include device and OS information

## 📱 SMS Expense Tracking

VStack can automatically read your SMS messages and extract transaction information:

### How It Works

1. **Grant SMS Permission** - The app requests permission to read SMS (Android only)
2. **Scan Recent SMS** - Reads your recent SMS messages to find transaction SMS
3. **Smart Parsing** - Automatically extracts:
   - Amount (₹)
   - Transaction type (Income/Expense)
   - Description/Merchant name
   - Category (based on keywords)
4. **Review & Add** - Review parsed transactions and add them with one tap

### Supported SMS Formats

- Bank debit/credit messages
- UPI transaction notifications
- Payment gateway confirmations
- Salary/income credits
- Refund notifications

### Privacy & Security

- SMS data is processed locally on your device
- No SMS data is sent to external servers
- You control which transactions to add
- Permission can be revoked anytime in Android settings

## 🔮 Future Enhancements

- [ ] Export data to CSV/PDF
- [ ] Budget templates
- [ ] Multiple currency support
- [ ] Cloud sync
- [ ] Budget sharing
- [ ] Advanced analytics
- [ ] Recurring transactions
- [ ] Bill reminders
- [ ] Real-time SMS monitoring

---

**Built with ❤️ using React Native and Expo**

