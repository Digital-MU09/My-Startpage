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

document.getElementById("search-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const query = document.getElementById("search-input").value.trim();

    if (query) {
        window.location.href = "https://www.google.com/search?q=" + encodeURIComponent(query);
    }
});

updateClock();
setInterval(updateClock, 1000);
