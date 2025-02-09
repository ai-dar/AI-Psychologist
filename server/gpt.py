import sys
import json
import g4f
import os
import time
from emotions import analyze_emotion

sys.stdout.reconfigure(encoding="utf-8")
sys.stdin.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

MAX_WAIT_TIME = 30

def get_gpt_response(dialogue_history):
    try:
        start_time = time.time()

        messages = []
        for entry in dialogue_history:
            if isinstance(entry, dict) and "text" in entry:
                messages.append({"role": "user", "content": f"{entry['text']} (Эмоция: {entry['emotion']})"})
            else:
                print(f"⚠ Ошибка: неверный формат диалога {entry}", flush=True)

        response = g4f.ChatCompletion.create(
            model="gpt-4",
            messages=messages
        )

        elapsed_time = time.time() - start_time

        if elapsed_time > MAX_WAIT_TIME:
            return "Ошибка: GPT отвечает слишком долго."

        return response.strip() if isinstance(response, str) else "Ошибка: Некорректный ответ"
    
    except Exception as e:
        return f"Ошибка GPT: {str(e)}"

if __name__ == "__main__":
    input_data = sys.stdin.read().strip()

    try:
        request_json = json.loads(input_data)
        dialogue_history = request_json.get("messages", [])

        if not isinstance(dialogue_history, list) or not all(isinstance(msg, dict) for msg in dialogue_history):
            print(json.dumps({"error": "Формат диалога неверен"}, ensure_ascii=False))
            sys.exit(1)

        if not dialogue_history:
            print(json.dumps({"error": "Пустой диалог"}, ensure_ascii=False))
            sys.exit(1)

        last_message = dialogue_history[-1]["text"]  
        detected_emotion = analyze_emotion(last_message)

        previous_emotions = [entry["emotion"] for entry in dialogue_history[:-1] if "emotion" in entry]
        if "тревога" in previous_emotions and detected_emotion == "нейтральное состояние":
            detected_emotion = "тревога"

        gpt_response = get_gpt_response(dialogue_history)

        print(json.dumps({"response": gpt_response, "emotion": detected_emotion}, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))