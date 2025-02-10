const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Настройки CORS (без дубликатов!)
const allowedOrigins = ["https://ai-psychologist-production-c69a.up.railway.app"];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true
}));

// ✅ Обрабатываем preflight-запросы (важно!)
app.options("*", cors());

app.use(express.json());

// ✅ Раздача статических файлов
app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});

// ✅ Проверка, какой `python` используется (для диагностики)
spawn("which", ["python"]).stdout.on("data", (data) => {
    console.log("Используется Python:", data.toString().trim());
});

// ✅ Обработчик POST-запроса /ask
app.post("/ask", (req, res) => {
    const userMessage = req.body.message;
    const userIp = req.ip;

    if (!userMessage) {
        console.log("⚠️ Пустое сообщение!");
        return res.status(400).json({ error: "Введите сообщение!" });
    }

    console.log("📩 Запрос от клиента:", userMessage);

    if (!conversationHistory[userIp]) {
        conversationHistory[userIp] = [];
    }

    conversationHistory[userIp] = conversationHistory[userIp].filter(msg => typeof msg === "object");
    conversationHistory[userIp].push({ text: userMessage, emotion: "неизвестно" });

    if (conversationHistory[userIp].length > 5) {
        conversationHistory[userIp].shift();
    }

    console.log("📨 Отправляем в Python:", JSON.stringify({ messages: conversationHistory[userIp] }, null, 2));

    const pythonScriptPath = path.join(__dirname, "gpt.py");

    if (!fs.existsSync(pythonScriptPath)) {
        console.error("❌ Ошибка: gpt.py не найден.");
        return res.status(500).json({ error: "Ошибка сервера: gpt.py отсутствует" });
    }

    try {
        const pythonProcess = spawn("python", [pythonScriptPath]);

        let responseData = "";

        pythonProcess.stdout.on("data", (data) => {
            responseData += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
            console.error("⚠️ Ошибка в Python-скрипте:", data.toString());
        });

        pythonProcess.on("close", () => {
            try {
                responseData = responseData.trim();
                responseData = responseData.replace(/New g4f version: .*?\| pip install -U g4f\n?/g, "").trim();

                console.log("✅ Очищенный ответ от Python:", responseData);

                if (!responseData) {
                    throw new Error("Python вернул пустой ответ");
                }

                const responseJson = JSON.parse(responseData);

                conversationHistory[userIp][conversationHistory[userIp].length - 1].emotion = responseJson.emotion;
                res.json(responseJson);
            } catch (error) {
                console.error("❌ Ошибка при обработке JSON:", error);
                res.status(500).json({ error: "Ошибка обработки ответа от GPT" });
            }
        });

        pythonProcess.stdin.write(JSON.stringify({ messages: conversationHistory[userIp] }) + "\n");
        pythonProcess.stdin.end();
    } catch (error) {
        console.error("❌ Ошибка запуска Python-процесса:", error);
        res.status(500).json({ error: "Ошибка сервера при запуске Python" });
    }
});

// ✅ Запуск сервера
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
}).on("error", (err) => {
    console.error("❌ Ошибка запуска сервера:", err.message);
});
