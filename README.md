
# QuickNotes System Design

QuickNotes is a lightweight web application prototype for creating, viewing, and deleting notes. This project demonstrates API integration, REST API design, relational database modeling, and system architecture planning.

## Features

- Retrieve notes using HTTP GET.
- Create notes using HTTP POST.
- Delete notes using HTTP DELETE.
- Validate note titles.
- Display loading, success, empty, and error messages.
- Use responsive styling for desktop and mobile screens.
- Document the proposed API, database schema, and scalable architecture.

## Technologies Used

- HTML5
- CSS3
- JavaScript (Fetch API and async/await)
- JSONPlaceholder practice API
- Git and GitHub

## Project Structure

```text
quicknotes-system-design/
├── index.html
├── style.css
├── api.js
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## How to Run the Project

1. Clone the repository:

   ```bash
   git clone https://github.com/muretigreg-max/quicknotes-system-design.git
   ```

2. Open the project folder in VS Code.

3. Open `index.html` using Live Server.

4. Click **Load Notes** to retrieve notes.

5. Use the form to create a note and the Delete button to remove one.

An internet connection is required because the application uses JSONPlaceholder.

## API Information

The prototype uses:

`https://jsonplaceholder.typicode.com/posts`

The application demonstrates GET, POST, and DELETE requests.

**Important limitation:** JSONPlaceholder is a testing service. POST and DELETE requests return simulated responses; they do not permanently create or delete server-side records. The browser updates its displayed list during the current session.

The documented QuickNotes API in `docs/api-design.md` is a proposed design, not a deployed production backend.

## Documentation

- [API Design](docs/api-design.md)
- [Data Model](docs/data-model.md)
- [System Architecture](docs/architecture.md)

## What I Learned

- How to make HTTP requests using the JavaScript Fetch API.
- How to handle asynchronous operations and API errors.
- How REST API methods represent different operations.
- How relational database tables use primary and foreign keys.
- How database relationships can be represented using SQL.
- How caching, load balancing, replication, and background processing can support scalability.
- How Git commits and GitHub help track and share project development.

## Future Improvements

- Implement a real backend API.
- Store notes permanently in a relational database.
- Add user registration and authentication.
- Support editing, searching, and tagging notes.
- Add automated tests and deployment monitoring.

## Author

Gregory Mureti

## License

This project is mine.
