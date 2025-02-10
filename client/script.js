const cors = require("cors");
const allowedOrigins = [
    "https://ai-psychologist-production-c69a.up.railway.app", // Фронтенд Railway
    "https://ai-psychologist-production-0fb2.up.railway.app"  // Бэкенд Railway
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS policy error"));
        }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

// Обрабатываем preflight-запросы
app.options("/ask", cors());
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
        const response = await fetch("https://ai-psychologist-production-0fb2.up.railway.app/ask", {
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
