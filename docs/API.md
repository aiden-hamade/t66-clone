# T66 API Documentation

## Overview

T66 provides a comprehensive REST API for building AI chat applications. The API is built on top of PocketBase and provides endpoints for authentication, chat management, AI interactions, and more.

## Base URL

```
Development: http://localhost:8090/api
Production: https://your-domain.com/api
```

## Authentication

T66 uses JWT-based authentication. Include the authorization header in all authenticated requests:

```http
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "verified": false,
    "created": "2025-01-01T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Logout User
```http
POST /auth/logout
Authorization: Bearer <token>
```

#### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <token>
```

## Chat Management

### Get User Chats
```http
GET /collections/chats/records
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `perPage` (int): Items per page (default: 30, max: 100)
- `sort` (string): Sort field (default: -created)
- `filter` (string): Filter expression

**Response:**
```json
{
  "page": 1,
  "perPage": 30,
  "totalItems": 15,
  "totalPages": 1,
  "items": [
    {
      "id": "chat_123",
      "title": "My Chat",
      "user": "user_123",
      "messages": ["msg_1", "msg_2"],
      "settings": {
        "model": "gpt-4",
        "temperature": 0.7,
        "systemMessage": "You are a helpful assistant"
      },
      "created": "2025-01-01T00:00:00Z",
      "updated": "2025-01-01T01:00:00Z"
    }
  ]
}
```

### Create New Chat
```http
POST /collections/chats/records
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
PATCH /collections/chats/records/{id}
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
DELETE /collections/chats/records/{id}
Authorization: Bearer <token>
```

## Messages

### Get Chat Messages
```http
GET /collections/messages/records
Authorization: Bearer <token>
?filter=(chat='{chat_id}')&sort=created
```

### Send Message
```http
POST /collections/messages/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "chat": "chat_123",
  "content": "Hello, how are you?",
  "role": "user",
  "attachments": ["file_123"]
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

### Available Models
```http
GET /api/models
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "gpt-4",
      "object": "model",
      "provider": "openai",
      "name": "GPT-4",
      "description": "Most capable GPT-4 model",
      "context_length": 8192,
      "pricing": {
        "input": 0.03,
        "output": 0.06
      }
    }
  ]
}
```

## Image Generation

### Generate Image
```http
POST /api/images/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "A beautiful sunset over mountains",
  "model": "dall-e-3",
  "size": "1024x1024",
  "quality": "standard",
  "n": 1
}
```

**Response:**
```json
{
  "created": 1234567890,
  "data": [
    {
      "url": "https://example.com/image.png",
      "revised_prompt": "A beautiful sunset over mountains with vibrant colors"
    }
  ]
}
```

## File Management

### Upload File
```http
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary-data>
```

**Response:**
```json
{
  "id": "file_123",
  "filename": "document.pdf",
  "size": 1024000,
  "type": "application/pdf",
  "url": "https://example.com/files/document.pdf",
  "created": "2025-01-01T00:00:00Z"
}
```

### Get File Info
```http
GET /api/files/{id}
Authorization: Bearer <token>
```

### Delete File
```http
DELETE /api/files/{id}
Authorization: Bearer <token>
```

## Web Search

### Search Web
```http
POST /api/search/web
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "latest AI developments 2025",
  "num_results": 10,
  "include_images": false
}
```

**Response:**
```json
{
  "query": "latest AI developments 2025",
  "results": [
    {
      "title": "AI Breakthrough 2025",
      "url": "https://example.com/article",
      "snippet": "Recent developments in AI...",
      "source": "Tech News",
      "published": "2025-01-01"
    }
  ],
  "search_time": 0.45
}
```

## Settings & Configuration

### Get User Settings
```http
GET /collections/user_settings/records
Authorization: Bearer <token>
?filter=(user='{user_id}')
```

### Update User Settings
```http
PATCH /collections/user_settings/records/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "theme": "dark",
  "default_model": "gpt-4",
  "api_keys": {
    "openai": "sk-...",
    "anthropic": "sk-ant-..."
  }
}
```

## Webhooks

### Register Webhook
```http
POST /api/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["chat.message.created", "chat.completed"],
  "secret": "webhook_secret"
}
```

## Rate Limits

- **Authentication**: 10 requests per minute
- **Chat Completions**: 100 requests per hour
- **Image Generation**: 50 requests per hour
- **File Uploads**: 20 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "The request is missing required parameters",
    "details": {
      "missing_fields": ["model", "messages"]
    }
  }
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## WebSocket API

For real-time features, connect to:
```
ws://localhost:8090/ws?token=<jwt-token>
```

### Events

#### Join Chat Room
```json
{
  "type": "join",
  "chat_id": "chat_123"
}
```

#### Leave Chat Room
```json
{
  "type": "leave",
  "chat_id": "chat_123"
}
```

#### Typing Indicator
```json
{
  "type": "typing",
  "chat_id": "chat_123",
  "user_id": "user_123"
}
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @t66/sdk
```

```javascript
import { T66Client } from '@t66/sdk';

const client = new T66Client({
  apiUrl: 'http://localhost:8090',
  apiKey: 'your-api-key'
});

const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

### Python
```bash
pip install t66-python
```

```python
import t66

client = t66.Client(
    api_url="http://localhost:8090",
    api_key="your-api-key"
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## Examples

See the [examples](./examples/) directory for complete implementation examples in various languages and frameworks. 