
# QuickNotes Data Model

## 1. Overview

QuickNotes uses a relational database to store users, notes, and tags.

The proposed design uses SQLite for development. A production deployment could use PostgreSQL to support larger workloads, stronger concurrent access, and managed database infrastructure.

## 2. Database Tables

### 2.1 Users

Stores information about registered users.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | Primary Key | Unique user identifier |
| name | VARCHAR(100) | NOT NULL | User's name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Login email |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| created_at | DATETIME | NOT NULL | Account creation time |

Passwords must be stored as secure password hashes, never as plain text.

### 2.2 Notes

Stores notes belonging to users.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | Primary Key | Unique note identifier |
| user_id | INTEGER | Foreign Key, NOT NULL | Owner of the note |
| title | VARCHAR(100) | NOT NULL | Note title |
| body | TEXT | Nullable | Note content |
| created_at | DATETIME | NOT NULL | Creation timestamp |
| updated_at | DATETIME | NOT NULL | Last update timestamp |

Each note belongs to one user. A user can have multiple notes.

### 2.3 Tags

Stores reusable labels for organizing notes.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | Primary Key | Unique tag identifier |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Tag name |

Examples include `personal`, `work`, and `study`.

### 2.4 Note_Tags

Connects notes to tags.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| note_id | INTEGER | Foreign Key, Primary Key component | Linked note |
| tag_id | INTEGER | Foreign Key, Primary Key component | Linked tag |

The combination of `note_id` and `tag_id` forms a composite primary key. This prevents the same tag from being attached to the same note more than once.

## 3. Entity Relationships

- **Users to Notes:** One-to-many. One user can own many notes.
- **Notes to Tags:** Many-to-many. A note can have several tags, and a tag can belong to several notes.
- **Notes to Note_Tags:** One-to-many.
- **Tags to Note_Tags:** One-to-many.

### Relationship Diagram

```text
USERS
  |
  | 1 to many
  v
NOTES
  |
  | 1 to many
  v
NOTE_TAGS
  ^
  | many to 1
  |
TAGS
```

## 4. SQL Table Definitions

The following SQL uses SQLite syntax.

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id)
        REFERENCES notes(id)
        ON DELETE CASCADE,
    FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_notes_user_created
ON notes(user_id, created_at);
```

The `ON DELETE CASCADE` rules remove a user's notes and their tag links when the relevant parent records are deleted. The index helps retrieve a user's notes ordered by creation time.

## 5. Example SQL Queries

### Query 1: Retrieve all notes belonging to a user

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 1
ORDER BY created_at DESC;
```

**Purpose:** Displays the user's most recent notes first.

### Query 2: Search notes by title

```sql
SELECT id, title, body
FROM notes
WHERE user_id = 1
  AND title LIKE '%meeting%';
```

**Purpose:** Finds notes whose titles contain the word `meeting`. For large datasets, a dedicated search index may be needed.

### Query 3: Retrieve notes with their tags

```sql
SELECT
    n.id,
    n.title,
    t.name AS tag
FROM notes AS n
JOIN note_tags AS nt ON nt.note_id = n.id
JOIN tags AS t ON t.id = nt.tag_id
WHERE n.user_id = 1
ORDER BY n.id;
```

**Purpose:** Uses joins to display notes alongside their associated tags.

### Query 4: Count notes per user

```sql
SELECT
    u.id,
    u.name,
    COUNT(n.id) AS total_notes
FROM users AS u
LEFT JOIN notes AS n ON n.user_id = u.id
GROUP BY u.id, u.name;
```

**Purpose:** Counts each user's notes, including users who have not created any.

## 6. SQL vs. NoSQL

A relational database is suitable for QuickNotes because the application has clear relationships between users, notes, and tags. Foreign keys and constraints help maintain data integrity, while SQL joins support reporting and filtering.

A NoSQL database could be useful if the application needed a flexible document structure or a distributed data model with different scaling requirements. However, storing tags directly inside note documents can make shared tag management and relationship enforcement more complicated.

For this design, a relational database is the preferred starting point.

## 7. Data Integrity and Security

- Use primary keys to identify records uniquely.
- Use foreign keys to maintain valid relationships.
- Enforce unique email addresses and tag names.
- Validate user input before saving it.
- Use parameterized SQL queries to reduce SQL injection risks.
- Restrict each user to their own notes.
- Store password hashes rather than passwords.
- Back up production data and apply appropriate access controls.

## 8. Design Assumptions

- Each user owns their notes.
- Note titles are required and limited to 100 characters.
- Note bodies are optional.
- Tags can be shared across multiple notes.
- Timestamps record when notes are created and updated.
- The SQL schema is a proposed design and is not yet connected to the JSONPlaceholder practice API.
