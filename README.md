# Portfolio On Flask

Учебный проект для защиты: визуальное портфолио на Flask с SQLite, формой обратной связи и отдельной страницей сообщений.

## Структура

- `app.py` — Flask-приложение и маршруты.
- `run_server.py` — production-запуск через `waitress`.
- `templates/` — серверные HTML-шаблоны.
- `static/` — общие стили, скрипты, шрифты и изображения. 
- `data/portfolio.db` — SQLite-база с контентом сайта.
- `supabase_submissions.sql` — SQL-схема таблицы сообщений для Supabase.
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

Локально, если переменные Supabase не заданы, сообщения сохраняются в SQLite.

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

## Supabase для формы и страницы базы

На Vercel SQLite плохо подходит для записи, поэтому сообщения формы можно хранить в Supabase, а контент сайта оставить в локальной SQLite-базе.

Нужны две переменные окружения:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Важно: используйте именно `service_role` ключ только на сервере. Его нельзя вставлять во фронтенд.

Как подключить:

1. Создайте проект в Supabase.
2. Откройте SQL Editor.
3. Выполните SQL из файла `supabase_submissions.sql`.
4. В Vercel добавьте `SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY`.
5. Передеплойте проект.

После этого:

- форма будет сохранять сообщения в Supabase;
- `/admin/messages` будет читать сообщения из Supabase;
- `/health` покажет `submissions_backend: "supabase"`.

## Маршруты Flask-версии

- `GET /` — главная страница портфолио.
- `GET /api/content` — JSON с контентом.
- `POST /api/messages` — сохранение формы.
- `GET /admin/messages` — просмотр сообщений.
- `GET /api/admin/messages` — JSON со списком сообщений.
