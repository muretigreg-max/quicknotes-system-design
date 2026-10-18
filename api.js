
"use strict";

// Practice API: JSONPlaceholder simulates a notes service.
const API_URL = "https://jsonplaceholder.typicode.com/posts";

// Select the HTML elements.
const loadButton = document.querySelector("#load-btn");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitButton = document.querySelector("#submit-btn");
const statusMessage = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");

// Keep the currently displayed notes in memory.
let notes = [];

// Display status messages with distinct success and error styles.
function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

// Reusable request function for API calls.
async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error("Request failed with status " + response.status);
  }

  return {
    data: response.status === 204 ? null : await response.json(),
    status: response.status,
  };
}

// Render notes safely using textContent.
function renderNotes(noteList) {
  notesList.replaceChildren();

  if (noteList.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "No notes to display.";
    notesList.append(emptyMessage);
    return;
  }

  noteList.forEach(function (note) {
    const item = document.createElement("li");
    item.className = "note-item";

    const title = document.createElement("h3");
    title.textContent = note.title;

    const body = document.createElement("p");
    body.textContent = note.body || "No body provided.";

    item.append(title, body);
    notesList.append(item);
  });
}

// GET: Load the first 10 notes.
async function loadNotes() {
  loadButton.disabled = true;
  showStatus("Loading notes...");
  notesList.replaceChildren();

  try {
    const result = await request(API_URL + "?_limit=10");

    notes = result.data;
    renderNotes(notes);
    showStatus(
      notes.length > 0
        ? "Loaded " + notes.length + " notes from the server."
        : "No notes were returned by the server.",
      "success"
    );
  } catch (error) {
    showStatus("Unable to load notes. Please try again.", "error");
    console.error("Error loading notes:", error);
  } finally {
    loadButton.disabled = false;
  }
}

// Load notes when the button is clicked.
loadButton.addEventListener("click", loadNotes);
