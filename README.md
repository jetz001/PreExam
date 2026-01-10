# PreExam Project

PreExam is a web application designed to help users prepare for exams, featuring examination tools, a community forum, and social features.

## Project Structure

- **client**: React-based frontend application (Vite).
- **server**: Express.js backend application with SQLite database.

## Prerequisites

- Node.js (v16 or higher recommended)
- npm

## Setup Instructions

### 1. Database Setup

The project uses a SQLite database. The server will automatically synchronize models and create the `database.sqlite` file in the `server` directory upon the first run.

### 2. Server Setup

Navigate to the `server` directory and install dependencies:

```bash
cd server
npm install
```

Start the development server:

```bash
npm run dev
```

The server will generally run on `http://localhost:3000`.

### 3. Client Setup

Navigate to the `client` directory and install dependencies:

```bash
cd client
npm install
```

Start the client development server:

```bash
npm run dev
```

The client will usually be accessible at `http://localhost:5173`.

## Environment Variables

Check `.env` file in the `server` directory for configuration. Common variables include:
- `PORT`: Server port
- `JWT_SECRET`: Secret key for authentication
- `NODE_ENV`: development/production

## Testing

To run backend tests (after ensuring dependencies are installed):

```bash
cd server
npm test
```
