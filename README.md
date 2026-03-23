# Resume / Portfolio Landing

Учебный проект по билету «Моё резюме — сайт для вашего резюме и портфолио».

Что реализовано:
- одностраничный лендинг на HTML/CSS/JS;
- сетка и компоненты на Bootstrap 5;
- анимации на GSAP + ScrollTrigger;
- серверная часть на Flask;
- подключение к SQLite-базе данных;
- форма обратной связи с сохранением сообщений в базу;
- API-роуты:
  - `GET /api/content`
  - `POST /api/messages`
  - `GET /admin/messages`

## Запуск

```bash
cd resume_portfolio_fullstack
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

После запуска откройте:
- `http://127.0.0.1:5000/` — сайт
- `http://127.0.0.1:5000/admin/messages` — сообщения из формы

Дополнительно:
- `FLASK_DEBUG=1 python app.py` — включить debug только при необходимости;
- `PORT=8000 python app.py` — запустить на другом порту;
- `python -m unittest discover -s tests` — прогнать smoke-тесты.

## Где лежат данные

SQLite-файл создаётся автоматически:
- `data/portfolio.db`

Если хотите изменить контент сайта, правьте seed-данные в `app.py` или обновляйте записи напрямую в SQLite.

## Что улучшено в кодовой базе

- приложение собрано через `app factory`, поэтому его проще тестировать и расширять;
- добавлена более аккуратная серверная валидация формы и индекс для быстрой загрузки заявок;
- фронтенд учитывает `prefers-reduced-motion`, lazy-load изображений и клавиатурную доступность;
- тяжёлые изображения в `static/assets` можно держать в облегчённом виде без потери качества для карточек.
