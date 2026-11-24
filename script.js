function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
    const date = now.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric"
    });

    document.getElementById("time").textContent = time;
    document.getElementById("date").textContent = date.toUpperCase();
}

const quotes = [
    "Hella search...",
    "Search it, shaka brah...",
    "I double dare you to search...",
    "Release the Kraken...",
    "What's the plan, Max?",
    "Ready for the mosh pit, shaka brah...",
    "Find something hella cool...",
    "Let's get hella crazy...",
    "No emoji!",
    "Step-douches beware...",
    "Bite me, search engine."
];

const defaultShortcuts = [
    { name: "YouTube", url: "https://www.youtube.com" },
    { name: "Facebook", url: "https://www.facebook.com" },
    { name: "Instagram", url: "https://www.instagram.com" },
    { name: "Pinterest", url: "https://www.pinterest.com" },
    { name: "Reddit", url: "https://www.reddit.com" },
    { name: "X (Twitter)", url: "https://x.com" },
    { name: "ChatGPT", url: "https://chatgpt.com" },
    { name: "Gemini", url: "https://gemini.google.com" },
    { name: "Gmail", url: "https://mail.google.com" },
    { name: "Chrome Web Store", url: "https://chromewebstore.google.com" },
    { name: "GitHub", url: "https://github.com" },
    { name: "4chan", url: "https://www.4chan.org" }
];

const MAX_SHORTCUTS = 24;

function storageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

function storageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        // Storage blocked or full: the page still works, changes just won't persist.
    }
}

function storageRemove(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        // Nothing to do if storage is blocked.
    }
}

function cloneDefaults() {
    return defaultShortcuts.map(function (shortcut) {
        return { name: shortcut.name, url: shortcut.url };
    });
}

function loadShortcuts() {
    try {
        const data = JSON.parse(storageGet("shortcuts"));

        if (!Array.isArray(data)) {
            return cloneDefaults();
        }

        // An empty list is valid: the user deleted every shortcut on purpose.
        if (data.length === 0) {
            return [];
        }

        const valid = data.filter(function (item) {
            return item && typeof item.name === "string" && typeof item.url === "string";
        });

        return valid.length > 0 ? valid : cloneDefaults();
    } catch (error) {
        return cloneDefaults();
    }
}

function saveShortcuts() {
    storageSet("shortcuts", JSON.stringify(shortcuts));
}

const searchInput = document.getElementById("search-input");
const savedQuoteIndex = Number(storageGet("quoteIndex")) || 0;
const quoteIndex = savedQuoteIndex % quotes.length;

searchInput.placeholder = quotes[quoteIndex];
storageSet("quoteIndex", (quoteIndex + 1) % quotes.length);
searchInput.focus();

let shortcuts = loadShortcuts();
const shortcutsGrid = document.getElementById("shortcuts-grid");
const editModal = document.getElementById("edit-modal");
const shortcutForm = document.getElementById("shortcut-form");
const dialogTitle = document.getElementById("dialog-title");
const shortcutNameInput = document.getElementById("shortcut-name");
const shortcutUrlInput = document.getElementById("shortcut-url");
const formError = document.getElementById("form-error");
const deleteButton = document.getElementById("delete-shortcut");
const resetButton = document.getElementById("reset-shortcuts");
let editingIndex = null; // null means "adding a new shortcut"

// A button that needs a second click within 3 seconds to confirm (no alert/confirm popups).
function setupConfirmButton(button, idleLabel, armedLabel, onConfirm) {
    let timer = null;

    function disarm() {
        clearTimeout(timer);
        timer = null;
        button.textContent = idleLabel;
        button.classList.remove("armed");
    }

    button.addEventListener("click", function () {
        if (timer === null) {
            button.textContent = armedLabel;
            button.classList.add("armed");
            timer = setTimeout(disarm, 3000);
            return;
        }

        disarm();
        onConfirm();
    });

    return disarm;
}

function getHostname(url) {
    try {
        return new URL(url).hostname;
    } catch (error) {
        return "";
    }
}

function createFallbackIcon(text) {
    const fallback = document.createElement("span");
    fallback.className = "shortcut-icon shortcut-icon-fallback";
    fallback.textContent = (text.trim().charAt(0) || "?").toUpperCase();
    return fallback;
}

function createIcon(shortcut) {
    const hostname = getHostname(shortcut.url);

    if (!hostname) {
        return createFallbackIcon(shortcut.name);
    }

    const icon = document.createElement("img");
    icon.className = "shortcut-icon";
    icon.src = "https://icon.horse/icon/" + hostname;
    icon.alt = "";
    icon.addEventListener("error", function () {
        icon.replaceWith(createFallbackIcon(shortcut.name));
    });
    return icon;
}

function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
}

function hideError() {
    formError.textContent = "";
    formError.hidden = true;
}

function openShortcutDialog(index) {
    const isEditing = index !== null;

    editingIndex = index;
    dialogTitle.textContent = isEditing ? "Edit shortcut" : "Add shortcut";
    shortcutNameInput.value = isEditing ? shortcuts[index].name : "";
    shortcutUrlInput.value = isEditing ? shortcuts[index].url : "";
    deleteButton.hidden = !isEditing;
    disarmDelete();
    hideError();
    editModal.showModal();
}

function renderShortcuts() {
    shortcutsGrid.innerHTML = "";

    shortcuts.forEach(function (shortcut, index) {
        const tile = document.createElement("div");
        tile.className = "shortcut";

        const link = document.createElement("a");
        link.className = "shortcut-link";
        link.href = shortcut.url;
        link.target = "_self";

        const icon = createIcon(shortcut);

        const name = document.createElement("span");
        name.textContent = shortcut.name;

        link.appendChild(icon);
        link.appendChild(name);

        const editButton = document.createElement("button");
        editButton.className = "edit-shortcut";
        editButton.type = "button";
        editButton.textContent = "⋮";
        editButton.title = "Edit shortcut";
        editButton.setAttribute("aria-label", "Edit " + shortcut.name);
        editButton.addEventListener("click", function () {
            openShortcutDialog(index);
        });

        tile.appendChild(link);
        tile.appendChild(editButton);
        shortcutsGrid.appendChild(tile);
    });

    if (shortcuts.length < MAX_SHORTCUTS) {
        const tile = document.createElement("div");
        tile.className = "shortcut shortcut-add";

        const addButton = document.createElement("button");
        addButton.className = "shortcut-link";
        addButton.type = "button";
        addButton.setAttribute("aria-label", "Add shortcut");
        addButton.addEventListener("click", function () {
            openShortcutDialog(null);
        });

        const plus = createFallbackIcon("+");
        const label = document.createElement("span");
        label.textContent = "Add";

        addButton.appendChild(plus);
        addButton.appendChild(label);
        tile.appendChild(addButton);
        shortcutsGrid.appendChild(tile);
    }
}

const disarmDelete = setupConfirmButton(deleteButton, "Delete", "Click again to delete", function () {
    if (editingIndex === null) {
        return;
    }

    shortcuts.splice(editingIndex, 1);
    saveShortcuts();
    renderShortcuts();
    editModal.close();
});

setupConfirmButton(resetButton, "Reset to defaults", "Click again to reset", function () {
    shortcuts = cloneDefaults();
    storageRemove("shortcuts");
    renderShortcuts();
});

document.getElementById("cancel-edit").addEventListener("click", function () {
    editModal.close();
});

// Clicking the dark area outside the dialog closes it.
editModal.addEventListener("click", function (event) {
    if (event.target !== editModal) {
        return;
    }

    const rect = editModal.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right &&
        event.clientY >= rect.top && event.clientY <= rect.bottom;

    if (!inside) {
        editModal.close();
    }
});

// The form submits on Enter or on the Save button.
shortcutForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const newName = shortcutNameInput.value.trim();
    let newUrl = shortcutUrlInput.value.trim();

    if (!newName || !newUrl) {
        showError("Please enter both a name and a URL.");
        return;
    }

    if (!/^https?:\/\//i.test(newUrl)) {
        newUrl = "https://" + newUrl;
    }

    try {
        new URL(newUrl);
    } catch (error) {
        showError("Please enter a valid URL.");
        return;
    }

    const shortcut = { name: newName, url: newUrl };

    if (editingIndex === null) {
        if (shortcuts.length >= MAX_SHORTCUTS) {
            showError("You can have up to " + MAX_SHORTCUTS + " shortcuts.");
            return;
        }

        shortcuts.push(shortcut);
    } else {
        shortcuts[editingIndex] = shortcut;
    }

    saveShortcuts();
    renderShortcuts();
    editModal.close();
});

document.getElementById("search-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const query = document.getElementById("search-input").value.trim();

    if (query) {
        window.location.href = "https://www.google.com/search?q=" + encodeURIComponent(query);
    }
});

renderShortcuts();
updateClock();
setInterval(updateClock, 1000);
