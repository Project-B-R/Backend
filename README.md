#

## Запуск

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

После запуска:

- `http://127.0.0.1:5000/` — сайт
- `http://127.0.0.1:5000/admin/messages` — сообщения из формы

 Portfolio On Flask

Учебный проект для защиты: портфолио на Flask с SQLite, админ-страницей для сообщений и одной основной страницей сайта.

## Что есть в проекте

- `app.py` — Flask-приложение, маршруты и seed-данные для базы.
- `templates/` — HTML-шаблоны сайта и админ-страницы.
- `static/` — стили, скрипты, шрифты и изображения.
- `data/portfolio.db` — SQLite-база с контентом и сообщениями формы.
- `tests/` — базовые smoke-тесты.

## Маршруты

- `GET /` — главная страница портфолио.
- `GET /api/content` — JSON с контентом сайта.
- `POST /api/messages` — отправка формы обратной связи.
- `GET /admin/messages` — просмотр сообщений из базы.
- `GET /api/admin/messages` — JSON со списком сообщений.
