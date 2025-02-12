import re

def analyze_emotion(text):
    text = text.lower()

    emotions = {
        "грусть": ["груст", "печаль", "депресс", "одиноч", "слё", "тоск", "депр", "сле", "мне плохо", "опустош", "разочар", "безысход"],
        "радость": ["счаст", "рад", "довол", "улыб", "восторг", "воодушев", "ликован", "наслажд", "эйфор", "супер", "кайф", "круто"],
        "тревога": ["тревог", "тревож", "тревожно", "паник", "страх", "нервоз", "беспокой", "пережива", "мне страшно", "опас", "угроз", "волн"],
        "стресс": ["устал", "раздраж", "напряж", "зл", "невыносим", "перегруз", "давлен", "выгорел", "измот", "изнур", "нервнич"],
        "злость": ["зл", "гнев", "ярост", "раздраж", "ненавист", "бесит", "ярость", "бешен", "агресс"],
        "страх": ["боюсь", "паник", "ужас", "ужасн", "дрож", "испуг", "жут", "кошмар"],
        "стыд": ["стыд", "позор", "смущен", "виноват", "опозор", "совест"],
        "удивление": ["удивл", "неожидан", "шок", "поражен", "изум"],
        "любовь": ["люб", "нежн", "забот", "обож", "восхищ", "роман", "страст"],
        "разочарование": ["разочар", "ожидал", "обид", "огорч", "надеял", "упущ", "жаль"],
        "отвращение": ["отвращ", "фу", "мерз", "брезг", "ненав"],
        "вина": ["вин", "сожал", "неправ", "ошиб", "прости", "извин"],
        "надежда": ["наде", "верю", "должн", "поможет", "хочется вер"],
        "спокойствие": ["споко", "умиротвор", "расслаб", "гармон", "безмят"],
        "вдохновение": ["вдохнов", "озарен", "творч", "мотив"],
        "уверенность": ["уверен", "точно", "без сомн", "справлюсь", "получ"],
        "нейтральное состояние": []
    }


    for emotion, patterns in emotions.items():
        for pattern in patterns:
            if pattern in text: 
                return emotion

    return "нейтральное состояние"
