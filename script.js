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

const searchInput = document.getElementById("search-input");
let quoteIndex = Number(localStorage.getItem("quoteIndex")) || 0;

searchInput.placeholder = quotes[quoteIndex];
localStorage.setItem("quoteIndex", (quoteIndex + 1) % quotes.length);
searchInput.focus();

document.getElementById("search-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const query = document.getElementById("search-input").value.trim();

    if (query) {
        window.location.href = "https://www.google.com/search?q=" + encodeURIComponent(query);
    }
});

updateClock();
setInterval(updateClock, 1000);
