
# API Documentation for User Management System

## Overview
This API allows managing user information, including creating, reading, updating, and deleting users. It uses MongoDB for database storage and Express.js for server-side handling.

---

## Base URL
```
https://ninza-backend2-0.onrender.com
```

---

## Endpoints

### 1. Get All Users
**Endpoint:**
```
GET /api/users
```
**Description:**
Fetches all users from the database.

**Response:**
- **Success (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "<id>",
        "user_id": "<user_id>",
        "first_name": "<first_name>",
        "last_name": "<last_name>",
        "email": "<email>",
        "gender": "<gender>",
        "avatar": "<avatar>"
      }
    ]
  }
  ```
- **Error (500):**
  ```json
  {
    "success": false,
    "message": "Internal Server Error"
  }
  ```

---

### 2. Get User by ID
**Endpoint:**
```
GET /api/users/:id
```
**Description:**
Fetches a specific user by their unique ID.

**Parameters:**
- `id` (string): The user ID.

**Response:**
- **Success (200):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "<id>",
      "user_id": "<user_id>",
      "first_name": "<first_name>",
      "last_name": "<last_name>",
      "email": "<email>",
      "gender": "<gender>",
      "avatar": "<avatar>"
    }
  }
  ```
- **Error (404):**
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```
- **Error (500):**
  ```json
  {
    "success": false,
    "message": "Internal Server Error"
  }
  ```

---

### 3. Create a New User
**Endpoint:**
```
POST /api/users
```
**Description:**
Adds a new user to the database.

**Request Body:**
```json
{
  "user_id": "<user_id>",
  "first_name": "<first_name>",
  "last_name": "<last_name>",
  "email": "<email>",
  "gender": "<gender>",
  "avatar": "<avatar>"
}
```

**Response:**
- **Success (201):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "<id>",
      "user_id": "<user_id>",
      "first_name": "<first_name>",
      "last_name": "<last_name>",
      "email": "<email>",
      "gender": "<gender>",
      "avatar": "<avatar>"
    }
  }
  ```
- **Error (500):**
  ```json
  {
    "success": false,
    "message": "Internal Server Error"
  }
  ```

---

### 4. Update User by ID
**Endpoint:**
```
PUT /api/users/:id
```
**Description:**
Updates an existing user's details.

**Parameters:**
- `id` (string): The user ID.

**Request Body:**
Partial or full update fields:
```json
{
  "first_name": "<first_name>",
  "last_name": "<last_name>",
  "email": "<email>",
  "gender": "<gender>",
  "avatar": "<avatar>"
}
```

**Response:**
- **Success (200):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "<id>",
      "user_id": "<user_id>",
      "first_name": "<first_name>",
      "last_name": "<last_name>",
      "email": "<email>",
      "gender": "<gender>",
      "avatar": "<avatar>"
    }
  }
  ```
- **Error (404):**
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```
- **Error (500):**
  ```json
  {
    "success": false,
    "message": "Internal Server Error"
  }
  ```

---

### 5. Delete User by ID
**Endpoint:**
```
DELETE /api/users/:id
```
**Description:**
Deletes a user by their unique ID.

**Parameters:**
- `id` (string): The user ID.

**Response:**
- **Success (200):**
  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```
- **Error (404):**
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```
- **Error (500):**
  ```json
  {
    "success": false,
    "message": "Internal Server Error"
  }
  ```

---

## Environment Variables
The application uses the following environment variables:
- `PORT`: The port number the server listens on (default: `3000`).
- `MONGO_URI`: The connection string for the MongoDB database.

---

## Error Handling
All endpoints return an appropriate status code and error message in case of failure. Ensure the database connection and request payload are valid to avoid errors.

---

## Schema
**User Schema:**
```javascript
{
  user_id: String,
  first_name: String,
  last_name: String,
  email: String,
  gender: String,
  avatar: String,
}
```
