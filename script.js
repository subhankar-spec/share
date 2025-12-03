function generateID(length = 8) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for (let i = 0; i < length; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

document.getElementById("shareBtn").addEventListener("click", () => {
    const text = document.getElementById("inputText").value.trim();

    if (text === "") {
        alert("Please enter some text!");
        return;
    }

    const id = generateID();
    localStorage.setItem("share_" + id, text);

    const link = window.location.origin + window.location.pathname + "view.html?id=" + id;

    const linkElement = document.getElementById("shareLink");
    linkElement.href = link;
    linkElement.innerText = link;

    document.getElementById("result").classList.remove("hidden");
});
