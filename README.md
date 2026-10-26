# PersonaAI Backend Services

PersonaAI Backend Services is built with **Node.js, Express.js, and MongoDB**. It manages virtual characters, stores chat conversations, and integrates with Google Gemini to generate AI-powered responses.

## Prerequisites

- [Node.js](https://nodejs.org/)
- MongoDB (local instance or MongoDB Atlas)
- Google Gemini API key

## Environment Configuration

Create a `.env` file in the project's root directory:

```dotenv
MONGO_DB_URI=mongodb://127.0.0.1:27017/personaai
PORT=3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
BASE_URL=http://localhost:3001
DEFAULT_CHARACTER_ID=7cf12ca4-ec00-46fd-a5b7-d908beff79b4
```

| Variable | Description |
|---|---|
| `MONGO_DB_URI` | MongoDB connection string. |
| `PORT` | Port on which the Express server runs. |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID. |
| `GOOGLE_GEMINI_API_KEY` | API key for Google Gemini. |
| `BASE_URL` | Base URL of the PersonaAI frontend. |
| `DEFAULT_CHARACTER_ID` | UUID of the default character. |

## How to Run


**1. Install dependencies**

```bash
npm install
```

**2. Configure the environment variables**

Create the `.env` file and provide the required values.

**3. Start the backend**


```bash
npm run dev
```

## Core Responsibilities

- **Character Management:** Creates, retrieves, and manages virtual character data in MongoDB.
- **Chat Management:** Processes conversations and stores chat data in MongoDB.
- **AI Integration:** Uses Google Gemini to generate character-specific responses.
- **API Services:** Provides endpoints for communication with the PersonaAI frontend.

## Frontend Integration

Configure the frontend's `.env` file with the backend URL:

```dotenv
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000
NUXT_PUBLIC_DEFAULT_CHARACTER_ID=7cf12ca4-ec00-46fd-a5b7-d908beff79b4
```

**Important:** `DEFAULT_CHARACTER_ID` in the backend and `NUXT_PUBLIC_DEFAULT_CHARACTER_ID` in the frontend must contain the same UUID. The corresponding character must also exist in the database.

Ensure that the frontend and backend use the correct ports and that CORS is configured appropriately.
