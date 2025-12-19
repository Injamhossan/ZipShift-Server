# ZipShift Server (Backend)

This is the backend API for **ZipShift Parcel**, powering the delivery management system. It handles data persistence, authentication, payment processing, and real-time updates.

## 🚀 Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) (with Mongoose)
- **Authentication:** JSON Web Tokens (JWT) & Firebase Admin
- **Real-time:** [Socket.io](https://socket.io/)
- **Payments:** [Stripe](https://stripe.com/)
- **API:** REST & GraphQL (Apollo Server)

## 🛠️ Installation & Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd ZipShift-Server
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up Environment Variables**:
    Create a `.env` file in the root of the `ZipShift-Server` directory.
    *Example:*
    ```env
    PORT=5000
    MONGO_URI=mongodb+srv://...
    STRIPE_SECRET_KEY=...
    JWT_SECRET=...
    FIREBASE_SERVICE_ACCOUNT=...
    ```

## 🏃‍♂️ Running the Server

To start the server in development mode (with hot-reloading via nodemon):

```bash
npm run dev
```

To start the server in production mode:

```bash
npm start
```

The server usually runs on `http://localhost:5000` (or `PORT` specified in `.env`).

## � Folder Structure

The application source code is located in the `src/` directory and follows the **MVC (Model-View-Controller)** architectural pattern:

-   `src/models/`: **Models** - Mongoose schemas defining data structures and validation rules.
-   `src/controllers/`: **Controllers** - Business logic and request handlers that bridge models and routes.
-   `src/routes/`: **routes** - API endpoint definitions that map URLs to specific controllers.
-   `src/services/`: **Services** - Encapsulated business logic for complex operations.
-   `src/middlewares/`: **Middlewares** - Functions for authentication (JWT), error handling, and request processing.
-   `src/config/`: **Config** - Configuration files for database connections and external services.
-   `src/utils/`: **Utils** - Helper functions and utilities.

## �🔑 Key Features

- **User & Admin Management:** Secure login and role-based access.
- **Parcel & Delivery Tracking:** CRUD operations for parcels.
- **Payment Integration:** Secure payment processing with Stripe.
- **Real-time Notifications:** Socket.io integration for instant updates.
