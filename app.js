// ============================================================
// State — array of objects is the single source of truth
// ============================================================
let todos = [];
let currentFilter = "all";

// ============================================================
// DOM elements
// ============================================================
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const itemsLeftEl = document.getElementById("items-left");
const filterButtons = document.querySelectorAll(".filter");
const clearCompletedBtn = document.getElementById("clear-completed");

// ============================================================
// Render — always redraw the whole list from the array
// ============================================================
function render() {
    // Clear the list (rebuild from state)
    todoList.textContent = "";

    // Which items to show, based on filter
    const visible = todos.filter((todo) => {
        if (currentFilter === "active") return !todo.completed;
        if (currentFilter === "completed") return todo.completed;
        return true; // "all"
    });

    visible.forEach((todo) => {
        todoList.appendChild(createTodoElement(todo));
    });

    updateStats();
}

// ============================================================
// createTodoElement — build one <li> with createElement
// and textContent (NEVER innerHTML for user text)
// ============================================================
function createTodoElement(todo) {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = todo.id;
    if (todo.completed) li.classList.add("completed");

    const span = document.createElement("span");
    span.className = "todo-text";
    span.textContent = todo.text; // safe: <b>hi</b> shows as text

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.type = "button";
    delBtn.textContent = "Delete";

    li.appendChild(span);
    li.appendChild(delBtn);
    return li;
}

// ============================================================
// Actions
// ============================================================
function addTodo(text) {
    todos.push({
        id: Date.now().toString(), // simple unique id
        text: text,
        completed: false,
    });
    render();
}

function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        render();
    }
}

function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    render();
}

function editTodo(id, newText) {
    const trimmed = newText.trim();
    if (!trimmed) return; // ignore empty edit (or you could delete)
    const todo = todos.find((t) => t.id === id);
    if (todo) {
        todo.text = trimmed;
        render();
    }
}

function updateStats() {
    const remaining = todos.filter((t) => !t.completed).length;
    itemsLeftEl.textContent =
        remaining === 1 ? "1 item left" : remaining + " items left";
}

// ============================================================
// Event: form submit (add task)
// ============================================================
form.addEventListener("submit", (event) => {
    event.preventDefault(); // stop page reload

    const text = input.value.trim();
    if (!text) return; // refuse empty / spaces-only

    addTodo(text);
    input.value = ""; // clear input
    input.focus();
});

// ============================================================
// Event delegation: ONE click listener on the list
// ============================================================
todoList.addEventListener("click", (event) => {
    const li = event.target.closest(".todo-item");
    if (!li) return; // clicked outside a task

    const id = li.dataset.id;

    if (event.target.classList.contains("delete-btn")) {
        deleteTodo(id);
        return;
    }

    // Otherwise a click on the text area toggles completed
    if (event.target.classList.contains("todo-text")) {
        toggleTodo(id);
    }
});

// ============================================================
// Bonus: double-click to edit
// ============================================================
todoList.addEventListener("dblclick", (event) => {
    const span = event.target.closest(".todo-text");
    if (!span) return;

    const li = span.closest(".todo-item");
    const id = li.dataset.id;
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    startEdit(li, span, todo);
});

function startEdit(li, span, todo) {
    // Replace the span with an input in place
    const editInput = document.createElement("input");
    editInput.className = "edit-input";
    editInput.value = todo.text;

    li.replaceChild(editInput, span);
    editInput.focus();
    editInput.setSelectionRange(todo.text.length, todo.text.length);

    let finished = false;

    function finish(save) {
        if (finished) return;
        finished = true;
        if (save) editTodo(todo.id, editInput.value);
        else render(); // redraw to restore the original span
    }

    editInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") finish(true);
        if (e.key === "Escape") finish(false);
    });

    // Clicking away also saves
    editInput.addEventListener("blur", () => finish(true));
}

// ============================================================
// Filters
// ============================================================
filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        currentFilter = btn.dataset.filter;

        // Move the "active" class with classList
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        render();
    });
});

// ============================================================
// Clear completed
// ============================================================
clearCompletedBtn.addEventListener("click", () => {
    todos = todos.filter((t) => !t.completed);
    render();
});

// ============================================================
// Start
// ============================================================
render();