# Smart Bus Companion

A modern MERN stack application designed to address gaps in current Indian city-bus tracking apps (like Chalo), focusing on offline capabilities, accessibility, public accountability, and real-time alerts.

## Project Structure
- `client/` - React frontend (Vite, TailwindCSS)
- `server/` - Node.js backend (Express, MongoDB)

## Environment Variables

### Server
Create a `.env` file in the `server/` directory:
- `PORT=5000` : The port on which the Express server runs.
- `MONGODB_URI=mongodb+srv://...` : MongoDB connection string. Essential for database operations.

## Running Locally

1. **Start the Server**
   ```bash
   cd server
   node server.js
   ```

2. **Start the Client**
   ```bash
   cd client
   npm run dev
   ```

Both server and client should run concurrently. The client will be available at `http://localhost:5173` and the server at `http://localhost:5000`.
