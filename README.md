# Portfolio On Flask

Учебный проект для защиты: визуальное портфолио на Flask с SQLite, формой обратной связи и отдельной страницей сообщений.

## Структура

- `app.py` — Flask-приложение и маршруты.
- `run_server.py` — production-запуск через `waitress`.
- `templates/` — серверные HTML-шаблоны.
- `static/` — общие стили, скрипты, шрифты и изображения.
- `data/portfolio.db` — SQLite-база с контентом и сообщениями.
- `tests/` — базовые smoke-тесты.
- `Dockerfile` — контейнерный запуск для деплоя.

## Локальный запуск Flask-версии

```bash
python -m pip install -r requirements.txt
python app.py
```

После запуска:

- `http://127.0.0.1:5000/` — основной сайт.
- `http://127.0.0.1:5000/admin/messages` — сообщения из формы.
- `http://127.0.0.1:5000/health` — health-check для деплоя.

## Production-запуск

В проекте уже есть production-запуск через `waitress` и Docker.

Запуск в production-режиме локально:

```bash
python -m pip install -r requirements.txt
python run_server.py
```

Docker-сборка:

```bash
docker build -t portfolio-flask .
docker run -p 8000:8000 portfolio-flask
```

Если база должна сохраняться между перезапусками, на хостинге нужен persistent volume или диск, примонтированный к папке `/app/data`, либо переменная `DATABASE` должна указывать на постоянный путь.

## Маршруты Flask-версии

- `GET /` — главная страница портфолио.
- `GET /api/content` — JSON с контентом.
- `POST /api/messages` — сохранение формы.
- `GET /admin/messages` — просмотр сообщений.
- `GET /api/admin/messages` — JSON со списком сообщений.
