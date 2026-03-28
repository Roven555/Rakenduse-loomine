# Movie Catalog Application

A React application for browsing movies with user authentication and MongoDB integration.

## Features

- Browse popular movies from TMDB API
- User registration and login with MongoDB storage
- JWT-based authentication
- Password hashing with bcrypt
- Responsive design

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- TMDB API key

### Installation

1. Clone the repository and navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `server/config.env` and update the values:
     - `ATLAS_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure secret key for JWT tokens
     - `PORT`: Server port (default: 5000)

4. Get a TMDB API key:
   - Sign up at [TMDB](https://www.themoviedb.org/)
   - Create an API key
   - Add it to your environment as `VITE_TMDB_API_KEY`

### Running the Application

1. Start the backend server:
   ```bash
   npm run server
   ```

2. In a separate terminal, start the frontend:
   ```bash
   npm run dev
   ```

3. Start both at the same time:
   ```bash
   npm run dev:full
   ```

4. Open your browser to `http://localhost:5173`

### API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires authentication)

## Technologies Used

- **Frontend**: React, Vite, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt
- **API**: TMDB API
