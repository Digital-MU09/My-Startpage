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

const searchInput = document.getElementById("search-input");
let quoteIndex = Number(localStorage.getItem("quoteIndex")) || 0;

searchInput.placeholder = quotes[quoteIndex];
localStorage.setItem("quoteIndex", (quoteIndex + 1) % quotes.length);
searchInput.focus();

let shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || defaultShortcuts;
const shortcutsGrid = document.getElementById("shortcuts-grid");
const editModal = document.getElementById("edit-modal");
const shortcutNameInput = document.getElementById("shortcut-name");
const shortcutUrlInput = document.getElementById("shortcut-url");
let editingIndex = null;

function getHostname(url) {
    return new URL(url).hostname;
}

function renderShortcuts() {
    shortcutsGrid.innerHTML = "";

    shortcuts.forEach(function (shortcut, index) {
        const tile = document.createElement("div");
        tile.className = "shortcut";

        const link = document.createElement("a");
        link.className = "shortcut-link";
        link.href = shortcut.url;
        link.target = "_blank";
        link.rel = "noopener";

        const icon = document.createElement("img");
        icon.className = "shortcut-icon";
        icon.src = "https://icon.horse/icon/" + getHostname(shortcut.url);
        icon.alt = "";

        const name = document.createElement("span");
        name.textContent = shortcut.name;

        link.appendChild(icon);
        link.appendChild(name);

        const editButton = document.createElement("button");
        editButton.className = "edit-shortcut";
        editButton.type = "button";
        editButton.textContent = "⋮";
        editButton.title = "Edit shortcut";
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
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
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
