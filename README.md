# Bank Account Kata

This project is a React application that simulates a banking system, allowing users to perform transactions, view their account balance, and access their transaction history. For simplicity, the application uses local storage for data persistence. Optionally, you can use `json-server` to simulate a backend API.

## Features

- **Frontend:** React application for user interface.
- **Data Persistence:** Local storage for storing account information and transactions.
- **Mock Server (Optional):** `json-server` for simulating a backend API.

## Getting Started

Follow these instructions to set up and run the project.

### 1. Initialize the React Project

1. **Create a new React application:**

   ```bash
   npx create-react-app bank-account-kata
   cd bank-account-kata
   ```


### 2. Using Local Storage for Data Persistence

The application uses local storage to persist account data and transactions. You do not need to install additional libraries for this purpose.

### 3. (Optional) Setting Up a Mock Server with `json-server`

To simulate a backend API, you can use `json-server`:

1. **Install `json-server` globally:**

   ```bash
   npm install -g json-server
   ```

2. **Create a `db.json` file in the root directory of your project:**

   ```json
   {
     "accounts": [
        {
        "id": "CH9300762011623852957",
        "balance": 0,
        "transactions": [],
        "accountHolder": "Ian Malcolm"
      },
      {
        "id": "AT611904300234573201",
        "balance": 0,
        "transactions": [],
        "accountHolder": "Jill Valentine"
      }
     ]
   }
   ```

3. **Run `json-server` to start the mock server:**

   ```bash
   json-server --watch db.json --port 5000
   ```

   This command will start a mock server that listens on port 5000 and serves the data from `db.json`.

### 4. Configuring the React Application

Update your React application to fetch and interact with data from the `json-server` API. Ensure you replace the API URLs in your code with the appropriate endpoints provided by `json-server`.

### 5. Running the Application

1. **Start the React development server:**

   ```bash
   npm start
   ```

   The application will be accessible at [http://localhost:3000](http://localhost:3000).

2. **If using `json-server`, ensure it is running in parallel:**

   ```bash
   json-server --watch db.json --port 5000
   ```

### Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request with your changes.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
