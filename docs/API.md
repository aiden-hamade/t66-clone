# T66 API Documentation

## Overview

T66 provides a comprehensive REST API for building AI chat applications. The API is built on Firebase and provides endpoints for authentication, chat management, AI interactions, and more.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

T66 uses Firebase Authentication with JWT tokens. Include the authorization header in all authenticated requests:

```http
Authorization: Bearer <your-firebase-id-token>
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "uid": "user_123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": false,
    "metadata": {
      "creationTime": "2025-01-01T00:00:00Z",
      "lastSignInTime": "2025-01-01T00:00:00Z"
    }
  },
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "refreshToken": "refresh_token_here"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Logout User
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

## Chat Management

### Get User Chats
```http
GET /api/chats
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (int): Number of items to return (default: 30, max: 100)
- `orderBy` (string): Sort field (default: createdAt)
- `orderDirection` (string): Sort direction (asc/desc, default: desc)
- `startAfter` (string): Cursor for pagination

**Response:**
```json
{
  "chats": [
    {
      "id": "chat_123",
      "title": "My Chat",
      "userId": "user_123",
      "messageCount": 5,
      "settings": {
        "model": "gpt-4",
        "temperature": 0.7,
        "systemMessage": "You are a helpful assistant"
      },
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T01:00:00Z"
    }
  ],
  "hasMore": false,
  "nextCursor": null
}
```

### Create New Chat
```http
POST /api/chats
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Chat",
  "settings": {
    "model": "gpt-4",
    "temperature": 0.7,
    "systemMessage": "You are a helpful assistant"
  }
}
```

### Update Chat
```http
PATCH /api/chats/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Chat Title",
  "settings": {
    "temperature": 0.8
  }
}
```

### Delete Chat
```http
DELETE /api/chats/{id}
Authorization: Bearer <token>
```

## Messages

### Get Chat Messages
```http
GET /api/chats/{chatId}/messages
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (int): Number of messages to return (default: 50)
- `orderBy` (string): Sort field (default: createdAt)
- `orderDirection` (string): Sort direction (asc/desc, default: asc)
- `startAfter` (string): Cursor for pagination

### Send Message
```http
POST /api/chats/{chatId}/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello, how are you?",
  "role": "user",
  "attachments": [
    {
      "type": "image",
      "url": "https://storage.googleapis.com/your-bucket/image.jpg",
      "name": "image.jpg"
    }
  ]
}
```

## AI Completions

### Chat Completions
```http
POST /api/chat/completions
Authorization: Bearer <token>
Content-Type: application/json

{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant"
    },
    {
      "role": "user", 
      "content": "Hello!"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 150,
  "stream": true
}
```

**Response (Streaming):**
```
data: {"id":"cmpl_123","object":"chat.completion.chunk","created":1234567890,"model":"gpt-4","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"cmpl_123","object":"chat.completion.chunk","created":1234567890,"model":"gpt-4","choices":[{"index":0,"delta":{"content":" there"},"finish_reason":null}]}

data: [DONE]
```

### Image Generation
```http
POST /api/images/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "A beautiful sunset over the ocean",
  "model": "dall-e-3",
  "size": "1024x1024",
  "quality": "standard",
  "n": 1
}
```

## File Management

### Upload File
```http
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <binary_data>,
  "type": "image"
}
```

**Response:**
```json
{
  "file": {
    "id": "file_123",
    "name": "image.jpg",
    "type": "image/jpeg",
    "size": 1024000,
    "url": "https://storage.googleapis.com/your-bucket/file_123.jpg",
    "downloadUrl": "https://storage.googleapis.com/your-bucket/file_123.jpg?token=...",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### Get File
```http
GET /api/files/{id}
Authorization: Bearer <token>
```

### Delete File
```http
DELETE /api/files/{id}
Authorization: Bearer <token>
```

## Real-time Updates

T66 uses Firebase Realtime Database for real-time updates. Connect to the following paths:

### Chat Updates
```javascript
// Listen for new messages in a chat
const messagesRef = firebase.database().ref(`chats/${chatId}/messages`);
messagesRef.on('child_added', (snapshot) => {
  const message = snapshot.val();
  // Handle new message
});
```

### Typing Indicators
```javascript
// Listen for typing indicators
const typingRef = firebase.database().ref(`chats/${chatId}/typing`);
typingRef.on('value', (snapshot) => {
  const typing = snapshot.val();
  // Handle typing status
});
```

## Error Handling

All API endpoints return standard HTTP status codes and error responses:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      "field": "email",
      "reason": "Email is required"
    }
  }
}
```

### Common Error Codes
- `UNAUTHENTICATED` (401): Invalid or missing authentication
- `PERMISSION_DENIED` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `ALREADY_EXISTS` (409): Resource already exists
- `INVALID_REQUEST` (400): Invalid request parameters
- `INTERNAL_ERROR` (500): Internal server error
- `RATE_LIMITED` (429): Too many requests

## Rate Limiting

API requests are rate-limited based on user authentication:

- **Authenticated users**: 1000 requests per hour
- **AI completions**: 100 requests per hour
- **File uploads**: 50 requests per hour

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

## Webhooks

T66 supports webhooks for real-time notifications:

### Chat Events
```http
POST /your-webhook-endpoint
Content-Type: application/json

{
  "event": "message.created",
  "data": {
    "chatId": "chat_123",
    "messageId": "msg_456",
    "userId": "user_123",
    "content": "Hello!",
    "timestamp": "2025-01-01T00:00:00Z"
  }
}
```

### Supported Events
- `chat.created`
- `chat.updated`
- `chat.deleted`
- `message.created`
- `message.updated`
- `user.created`
- `user.updated`

## SDK Examples

### JavaScript/TypeScript
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authenticate
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

// Create a chat
const chatRef = await addDoc(collection(db, 'chats'), {
  title: 'New Chat',
  userId: user.uid,
  createdAt: new Date(),
  settings: {
    model: 'gpt-4',
    temperature: 0.7
  }
});
```

### Python
```python
import firebase_admin
from firebase_admin import credentials, firestore, auth

# Initialize Firebase
cred = credentials.Certificate('path/to/serviceAccountKey.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

# Create a chat
doc_ref = db.collection('chats').add({
    'title': 'New Chat',
    'userId': user_id,
    'createdAt': firestore.SERVER_TIMESTAMP,
    'settings': {
        'model': 'gpt-4',
        'temperature': 0.7
    }
})
```

For more detailed examples and advanced usage, check the [GitHub repository](https://github.com/yourusername/t66-clone). 