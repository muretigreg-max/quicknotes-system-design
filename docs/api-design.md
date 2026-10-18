
# QuickNotes API Design

## 1. Overview

The QuickNotes API allows users to create, retrieve, update, and delete notes. It follows REST principles and uses JSON for request and response data.

The API uses HTTP methods to describe the operation being performed.

**Base URL:** `https://api.quicknotes.example.com/api`

**Data format:** JSON

## 2. API Endpoints

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| GET | `/notes` | Retrieve all notes | 200 OK |
| GET | `/notes/{noteId}` | Retrieve one note | 200 OK |
| POST | `/notes` | Create a new note | 201 Created |
| PUT | `/notes/{noteId}` | Replace an existing note | 200 OK |
| PATCH | `/notes/{noteId}` | Partially update a note | 200 OK |
| DELETE | `/notes/{noteId}` | Delete a note | 204 No Content |
| GET | `/tags` | Retrieve available tags | 200 OK |
| GET | `/notes?tag=study` | Retrieve notes with a specific tag | 200 OK |

## 3. Example: Retrieve Notes

### Request

`GET /api/notes`

### Successful Response — 200 OK

```json
{
  "data": [
    {
      "id": 1,
      "title": "Hydroponics Training",
      "body": "Prepare training materials.",
      "userId": 5,
      "createdAt": "2026-10-18T08:00:00Z",
      "updatedAt": "2026-10-18T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

## 4. Example: Create a Note

### Request

`POST /api/notes`

Content-Type: `application/json`

```json
{
  "title": "Meeting Notes",
  "body": "Discuss the project timeline."
}
```

### Successful Response — 201 Created

```json
{
  "data": {
    "id": 42,
    "title": "Meeting Notes",
    "body": "Discuss the project timeline.",
    "userId": 5,
    "createdAt": "2026-10-18T09:00:00Z",
    "updatedAt": "2026-10-18T09:00:00Z"
  }
}
```

The server obtains `userId` from the authenticated user rather than trusting a user ID supplied in the request body.

## 5. Example: Update a Note

### Request

`PATCH /api/notes/42`

```json
{
  "title": "Updated Meeting Notes"
}
```

### Successful Response — 200 OK

```json
{
  "data": {
    "id": 42,
    "title": "Updated Meeting Notes",
    "body": "Discuss the project timeline.",
    "userId": 5,
    "createdAt": "2026-10-18T09:00:00Z",
    "updatedAt": "2026-10-18T10:00:00Z"
  }
}
```

## 6. Example: Delete a Note

### Request

`DELETE /api/notes/42`

### Successful Response

`204 No Content`

The server deletes the note and returns no response body.

## 7. Error Handling

| Status Code | Meaning | Example Situation |
|---|---|---|
| 400 | Bad Request | Missing title or invalid input |
| 401 | Unauthorized | User is not authenticated |
| 403 | Forbidden | User cannot access another user's note |
| 404 | Not Found | Note does not exist |
| 409 | Conflict | Duplicate resource or conflicting update |
| 500 | Internal Server Error | Unexpected server failure |

### Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The note title is required.",
    "details": {
      "field": "title"
    }
  }
}
```

## 8. Validation and Security

- A note title is required and cannot exceed 100 characters.
- The body is optional.
- Input is validated on the server.
- Authentication is required for protected operations.
- Users can only access notes they own.
- HTTPS protects data while it is transmitted.
- Rate limiting helps prevent API abuse.
- Error responses avoid exposing passwords, tokens, or internal server details.

## 9. Pagination and Filtering

The API supports pagination and tag filtering.

Example:

`GET /api/notes?page=1&limit=10&tag=study`

Pagination prevents the server from returning every note in one response.

## 10. Development API vs. Proposed API

The current browser application uses JSONPlaceholder at `https://jsonplaceholder.typicode.com/posts` to practise GET, POST, and DELETE requests.

The endpoints documented above describe the proposed QuickNotes API. They are a design specification, not a claim that a production QuickNotes backend has already been implemented.
