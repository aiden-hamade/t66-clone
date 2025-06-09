# T66 Backend (PocketBase)

This directory contains the PocketBase backend for the T66 application.

## Quick Start

1. Download PocketBase from https://pocketbase.io/docs/
2. Place the `pocketbase` executable in this directory
3. Run: `./pocketbase serve`
4. Access admin UI at: http://localhost:8090/_/

## Directory Structure

- `pb_data/` - Database and uploaded files (auto-created)
- `pb_migrations/` - Database migrations 
- `pb_hooks/` - Custom Go hooks and extensions
- `pb_public/` - Static files served by PocketBase

## Collections Schema

The following collections will be created:

### Users (extends auth)
- Additional fields for user preferences
- API key storage (encrypted)
- Usage tracking

### Chats
- `title` (text)
- `user` (relation to users)
- `settings` (json) - model, temperature, etc.
- `created/updated` (auto)

### Messages  
- `chat` (relation to chats)
- `role` (text) - user/assistant/system
- `content` (text)
- `attachments` (file) - optional files
- `created` (auto)

### Files
- File metadata and processing status
- Links to uploaded attachments

## Custom Hooks

Custom business logic will be added in `pb_hooks/` for:
- AI provider integration
- Rate limiting
- Content moderation
- Usage tracking 