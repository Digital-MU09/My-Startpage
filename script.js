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

function loadShortcuts() {
    try {
        const data = JSON.parse(storageGet("shortcuts"));

        if (!Array.isArray(data)) {
            return defaultShortcuts;
        }

        const valid = data.filter(function (item) {
            return item && typeof item.name === "string" && typeof item.url === "string";
        });

        return valid.length > 0 ? valid : defaultShortcuts;
    } catch (error) {
        return defaultShortcuts;
    }
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
const shortcutNameInput = document.getElementById("shortcut-name");
const shortcutUrlInput = document.getElementById("shortcut-url");
let editingIndex = null;

function getHostname(url) {
    try {
        return new URL(url).hostname;
    } catch (error) {
        return "";
    }
}

function createFallbackIcon(name) {
    const fallback = document.createElement("span");
    fallback.className = "shortcut-icon shortcut-icon-fallback";
    fallback.textContent = (name.trim().charAt(0) || "?").toUpperCase();
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
            editingIndex = index;
            shortcutNameInput.value = shortcut.name;
            shortcutUrlInput.value = shortcut.url;
            editModal.showModal();
        });

        tile.appendChild(link);
        tile.appendChild(editButton);
        shortcutsGrid.appendChild(tile);
    });
}

document.getElementById("cancel-edit").addEventListener("click", function () {
    editModal.close();
});

document.getElementById("save-edit").addEventListener("click", function () {
    const newName = shortcutNameInput.value.trim();
    let newUrl = shortcutUrlInput.value.trim();

    if (!newName || !newUrl) {
        return;
    }

    if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
        newUrl = "https://" + newUrl;
    }

    try {
        new URL(newUrl);
    } catch (error) {
        alert("Please enter a valid URL.");
        return;
    }

    shortcuts[editingIndex] = {
        name: newName,
        url: newUrl
    };
    storageSet("shortcuts", JSON.stringify(shortcuts));
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
