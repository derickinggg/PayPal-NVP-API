# API Key Management Feature

This document describes the new API key management functionality that allows users to securely store and manage PayPal NVP API credentials directly in the web application.

## Features

### 1. Persistent Storage
- API keys are stored in a local SQLite database
- Passwords are encrypted using bcrypt for security
- Database file is automatically created in `server/data/app.db`

### 2. Web Interface
- **Save API Keys**: Users can save their credentials permanently with a custom name
- **View Saved Keys**: Display all saved API keys in a clean table format
- **Use Saved Keys**: Load saved credentials into the session with password verification
- **Delete Keys**: Remove unwanted API keys from storage

### 3. Security Features
- Passwords are hashed using bcrypt (never stored in plain text)
- Password verification required to use saved API keys
- Session-based authentication for API operations
- Database file excluded from version control

## Usage

### Saving API Keys

1. Enter your PayPal NVP credentials in the "Credentials" section
2. Click "Save Permanently" button
3. Fill in the save form:
   - **Name**: A descriptive name for this API key set
   - **Environment**: Sandbox or Live
   - **Username**: Your PayPal API username
   - **Password**: Your PayPal API password
   - **Signature**: Your PayPal API signature
4. Click "Save API Key"

### Using Saved API Keys

1. In the "Saved API Keys" section, find the key you want to use
2. Click "Use Key" button
3. Enter the password for verification
4. Click "Use" to load the credentials into your session
5. The credentials are now active and can be used for API calls

### Managing Saved Keys

- **View**: All saved keys are displayed with their name, username, environment, and creation date
- **Delete**: Click the "Delete" button to permanently remove an API key
- **Count**: The section header shows the total number of saved keys

## API Endpoints

### GET `/api/api-keys`
Returns all saved API keys (without passwords)

### POST `/api/api-keys`
Creates a new API key entry
```json
{
  "name": "My Production Key",
  "username": "your_username",
  "password": "your_password",
  "signature": "your_signature",
  "environment": "live"
}
```

### GET `/api/api-keys/:id`
Returns a specific API key by ID (without password)

### PUT `/api/api-keys/:id`
Updates an existing API key
```json
{
  "name": "Updated Name",
  "username": "updated_username",
  "password": "new_password", // optional
  "signature": "updated_signature",
  "environment": "sandbox"
}
```

### DELETE `/api/api-keys/:id`
Deletes an API key by ID

### POST `/api/api-keys/:id/use`
Loads an API key into the session after password verification
```json
{
  "password": "your_password"
}
```

## Database Schema

```sql
CREATE TABLE api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    signature TEXT NOT NULL,
    environment TEXT NOT NULL DEFAULT 'sandbox',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcrypt with a salt factor of 10
2. **No Plain Text Storage**: Original passwords are never stored, only hashes
3. **Session Security**: API keys are loaded into encrypted sessions
4. **Database Security**: The SQLite database file should be protected with appropriate file permissions
5. **HTTPS**: Use HTTPS in production to protect data in transit

## File Structure

```
server/
├── src/
│   ├── database.js          # Database operations and schema
│   ├── routes.js            # API endpoints (updated)
│   └── index.js             # Server initialization (updated)
├── data/                    # Created automatically
│   └── app.db              # SQLite database file
└── .gitignore              # Excludes database from version control

client/
└── src/
    └── App.jsx             # Updated UI with API key management
```

## Dependencies Added

### Server
- `sqlite3`: SQLite database driver
- `bcrypt`: Password hashing library

## Environment Variables

No additional environment variables are required. The database will be created automatically in the `server/data/` directory.

## Troubleshooting

### Database Issues
- Ensure the `server/data/` directory is writable
- Check server logs for database connection errors
- The database file will be created automatically on first run

### Permission Issues
- Verify that the server process has write permissions to the data directory
- Check file system permissions on the database file

### API Errors
- Check the browser console for detailed error messages
- Verify that the server is running and accessible
- Ensure proper JSON formatting in API requests