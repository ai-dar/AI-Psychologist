async function askAI() {
    const userInput = document.getElementById("userInput").value.trim();
    const chatBox = document.getElementById("chat-box");
    const emotionElement = document.getElementById("emotion");

    if (!userInput) return;

    chatBox.innerHTML += `<div class="message user">${userInput}</div>`;
    document.getElementById("userInput").value = "";
    chatBox.innerHTML += `<div class="message ai processing">MindLink Обрабатывается...</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch("http://localhost:3000/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput })
        });

        const data = await response.json();
        document.querySelector(".message.ai.processing").remove(); 

        chatBox.innerHTML += `<div class="message ai">${data.response || "Ошибка при обработке"}</div>`;
        emotionElement.innerText = data.emotion || "Не определено";

        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        chatBox.innerHTML += `<div class="message ai error">Ошибка соединения с сервером</div>`;
    }
}

function handleKeyPress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        askAI();
    }
}
window.onload = function() {
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<div class="message ai">Привет! Я ваш ИИ-психолог. Меня зовут MindLink AI. Чем могу помочь?</div>`;
};
