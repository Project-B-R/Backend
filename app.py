from __future__ import annotations

import os
import sqlite3
from pathlib import Path
from typing import Any, Mapping

from flask import Flask, current_app, g, jsonify, render_template, request

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DB_PATH = BASE_DIR / 'data' / 'portfolio.db'

CONTENT_QUERIES = {
    'contacts': 'SELECT * FROM contacts ORDER BY sort_order, id',
    'experience': 'SELECT * FROM experience ORDER BY sort_order, id',
    'skills': 'SELECT * FROM skills ORDER BY sort_order, id',
    'education': 'SELECT * FROM education ORDER BY sort_order, id',
    'projects': 'SELECT * FROM projects ORDER BY sort_order, id LIMIT 3',
    'gallery': 'SELECT * FROM gallery ORDER BY sort_order, id',
}

SUBMISSIONS_QUERY = '''
SELECT id, name, contact, message, created_at
FROM submissions
ORDER BY datetime(created_at) DESC, id DESC
'''


def create_app(test_config: Mapping[str, Any] | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(
        DATABASE=DEFAULT_DB_PATH,
        HOST=os.getenv('FLASK_HOST', '127.0.0.1'),
        PORT=int(os.getenv('PORT', '5000')),
        DEBUG=os.getenv('FLASK_DEBUG', '').lower() in {'1', 'true', 'yes', 'on'},
        JSON_AS_ASCII=False,
        JSON_SORT_KEYS=False,
        MAX_CONTENT_LENGTH=16 * 1024,
    )
    app.json.ensure_ascii = False

    if test_config:
        app.config.update(test_config)

    app.teardown_appcontext(close_db)
    register_routes(app)

    with app.app_context():
        init_db()

    return app


def get_db() -> sqlite3.Connection:
    if 'db' not in g:
        database_path = Path(current_app.config['DATABASE'])
        database_path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(str(database_path))
        connection.row_factory = sqlite3.Row
        connection.execute('PRAGMA foreign_keys = ON')
        g.db = connection
    return g.db


def close_db(_: Exception | None = None) -> None:
    db = g.pop('db', None)
    if db is not None:
        db.close()


def seed_table_if_empty(cursor: sqlite3.Cursor, table: str, query: str, rows: list[tuple[Any, ...]]) -> None:
    count = cursor.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0]
    if count == 0:
        cursor.executemany(query, rows)


def init_db() -> None:
    database_path = Path(current_app.config['DATABASE'])
    database_path.parent.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(str(database_path)) as conn:
        cursor = conn.cursor()
        cursor.executescript(
            '''
            CREATE TABLE IF NOT EXISTS profile (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                title TEXT NOT NULL,
                short_bio TEXT NOT NULL,
                about_text TEXT NOT NULL,
                hero_media TEXT NOT NULL,
                accent_note TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                label TEXT NOT NULL,
                value TEXT NOT NULL,
                url TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS experience (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                period TEXT NOT NULL,
                title TEXT NOT NULL,
                organization TEXT NOT NULL,
                description TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                items TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS education (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                period TEXT NOT NULL,
                title TEXT NOT NULL,
                organization TEXT NOT NULL,
                description TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                subtitle TEXT NOT NULL,
                description TEXT NOT NULL,
                image TEXT NOT NULL,
                url TEXT NOT NULL,
                year TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS gallery (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                caption TEXT NOT NULL,
                image TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                contact TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_submissions_created_at
            ON submissions(created_at DESC, id DESC);
            '''
        )

        seed_table_if_empty(
            cursor,
            'profile',
            '''
            INSERT INTO profile (name, title, short_bio, about_text, hero_media, accent_note)
            VALUES (?, ?, ?, ?, ?, ?)
            ''',
            [
                (
                    'Винсента',
                    'художница / иллюстратор',
                    'Автор атмосферных иллюстраций, печатных серий и визуальных историй. В работах — мягкий свет, природные сцены, сюжетные композиции и тёплая палитра, которую легко перенести и в digital, и в печать.',
                    'Этот лендинг собран как резюме-портфолио: здесь есть краткая информация, опыт, навыки, образование, три ключевых проекта и контактная форма. Все основные блоки подтягиваются из базы данных, поэтому сайт можно быстро редактировать без ручной правки вёрстки.',
                    'assets/window-blossom.jpg',
                    'olive petal / golden clover / arctic daisy / rose blush / peach blossom',
                )
            ],
        )

        seed_table_if_empty(
            cursor,
            'contacts',
            '''
            INSERT INTO contacts (label, value, url, sort_order)
            VALUES (?, ?, ?, ?)
            ''',
            [
                ('Telegram', '@vinsentaaaa', 'https://t.me/vinsentaaaa', 1),
                ('Спам-канал', '@chemicalvinsenta', 'https://t.me/chemicalvinsenta', 2),
                ('Instagram', '@_vinsenta', 'https://www.instagram.com/_vinsenta/', 3),
                ('X / Twitter', '@_vinsenta', 'https://twitter.com/_vinsenta', 4),
                ('VK', 'vk.com/vinsenta', 'https://vk.com/vinsenta', 5),
            ],
        )

        seed_table_if_empty(
            cursor,
            'experience',
            '''
            INSERT INTO experience (period, title, organization, description, sort_order)
            VALUES (?, ?, ?, ?, ?)
            ''',
            [
                ('20XX — сейчас', 'Авторская художественная практика', 'Личные проекты', 'Разработка самостоятельных иллюстраций, печатных серий и визуальных историй. Работа с композицией, цветом, атмосферой сцены и подготовкой изображений для публикации.', 1),
                ('20XX — 20XX', 'Учебные и командные проекты', 'Учебная среда / коллаборации', 'Создание визуалов для презентаций, постеров, учебных кейсов и совместных творческих задач. Координация стиля, подбор референсов и сбор итоговой подачи.', 2),
                ('20XX — 20XX', 'Заказные иллюстрации', 'Фриланс / частные запросы', 'Адаптация авторского стиля под открытки, постеры, обложки, анонсы и мерч. Общение с заказчиком, подбор решений и подготовка финальных файлов.', 3),
            ],
        )

        seed_table_if_empty(
            cursor,
            'skills',
            '''
            INSERT INTO skills (category, items, sort_order)
            VALUES (?, ?, ?)
            ''',
            [
                ('Иллюстрация', 'сюжетные сцены, персонажи, природные пейзажи, атмосферные серии, визуальные истории', 1),
                ('Подготовка макетов', 'постеры, открытки, принты, обложки, цифровые карточки для соцсетей', 2),
                ('Софт', 'Figma, Adobe Photoshop, Procreate, базовая подготовка контента для web', 3),
                ('Коммуникация', 'работа с правками, оформление проекта, сбор референсов, презентация концепта', 4),
            ],
        )

        seed_table_if_empty(
            cursor,
            'education',
            '''
            INSERT INTO education (period, title, organization, description, sort_order)
            VALUES (?, ?, ?, ?, ?)
            ''',
            [
                ('20XX — 20XX', 'Основное образование', 'Добавьте вуз / колледж / направление', 'Здесь можно указать официальное образование, профиль и важные дисциплины.', 1),
                ('20XX', 'Курсы по иллюстрации и композиции', 'Добавьте реальный курс', 'Подойдёт информация о курсах по цвету, композиции, печати, digital-иллюстрации или дизайну.', 2),
            ],
        )

        seed_table_if_empty(
            cursor,
            'projects',
            '''
            INSERT INTO projects (title, subtitle, description, image, url, year, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''',
            [
                ('Берег и серия принтов', 'Печатная подборка / visual story', 'Набор листов с природными сценами, береговой линией, зеленью и мягким ощущением ручной бумаги. Проект показывает работу с серией, единым цветовым настроением и подготовкой изображений для печати.', 'assets/prints.jpg', 'https://t.me/vinsentaaaa', '2025', 1),
                ('Прогулка под облаками', 'Сюжетная иллюстрация', 'Сцена с персонажами, полем и домом, где композиция строится вокруг объёма облака и воздушной перспективы. Хорошо показывает умение работать с повествованием внутри одного кадра.', 'assets/cloud-walk.jpg', 'https://t.me/vinsentaaaa', '2025', 2),
                ('Весенняя повозка', 'Большая атмосферная сцена', 'Иллюстрация с цветущим пространством и движением внутри кадра. Проект демонстрирует глубокий фон, декоративные детали и живую работу со светом.', 'assets/spring-carriage.jpg', 'https://t.me/vinsentaaaa', '2025', 3),
            ],
        )

        seed_table_if_empty(
            cursor,
            'gallery',
            '''
            INSERT INTO gallery (title, category, caption, image, sort_order)
            VALUES (?, ?, ?, ?, ?)
            ''',
            [
                ('Берег и серия принтов', 'print', 'Подборка листов с водой, зеленью и атмосферой печатной серии.', 'assets/prints.jpg', 1),
                ('Прогулка под облаками', 'story', 'Сюжетная сцена с персонажами и вечерним небом.', 'assets/cloud-walk.jpg', 2),
                ('Дом в цветущем саду', 'landscape', 'Пейзажная работа с домом, садом и пастельным светом.', 'assets/green-house.jpg', 3),
                ('Лесные сёстры', 'character', 'Композиция на близости персонажей и контрасте света с лесом.', 'assets/forest-sisters.jpg', 4),
                ('Окно и цветение', 'character', 'Портрет с ветвями, пятнами света и весенним воздухом.', 'assets/window-blossom.jpg', 5),
                ('Весенняя повозка', 'story', 'Большая сцена с декоративным цветением и глубиной пространства.', 'assets/spring-carriage.jpg', 6),
            ],
        )

        conn.commit()


def normalize_single_line(value: Any, *, max_length: int) -> str:
    return ' '.join(str(value).split())[:max_length]


def normalize_message(value: Any, *, max_length: int) -> str:
    raw_lines = str(value).replace('\r\n', '\n').replace('\r', '\n').split('\n')
    cleaned_lines = [' '.join(line.split()) for line in raw_lines]
    compact_message = '\n'.join(line for line in cleaned_lines if line).strip()
    return compact_message[:max_length]


def validate_submission(payload: Mapping[str, Any]) -> tuple[dict[str, str], dict[str, str]]:
    submission = {
        'name': normalize_single_line(payload.get('name', ''), max_length=80),
        'contact': normalize_single_line(payload.get('contact', ''), max_length=120),
        'message': normalize_message(payload.get('message', ''), max_length=1500),
    }
    errors: dict[str, str] = {}

    if len(submission['name']) < 2:
        errors['name'] = 'Укажите имя не короче двух символов.'
    if len(submission['contact']) < 3:
        errors['contact'] = 'Добавьте удобный способ связи.'
    if len(submission['message']) < 8:
        errors['message'] = 'Сообщение должно быть чуть подробнее.'

    return submission, errors


def serialize_item(row: sqlite3.Row | None) -> dict[str, Any]:
    return dict(row) if row is not None else {}


def serialize_rows(rows: list[sqlite3.Row]) -> list[dict[str, Any]]:
    return [dict(row) for row in rows]


def fetch_all() -> dict[str, Any]:
    db = get_db()
    content = {
        'profile': serialize_item(db.execute('SELECT * FROM profile LIMIT 1').fetchone()),
    }

    for key, query in CONTENT_QUERIES.items():
        content[key] = serialize_rows(db.execute(query).fetchall())

    return content


def fetch_submissions() -> list[dict[str, Any]]:
    db = get_db()
    rows = db.execute(SUBMISSIONS_QUERY).fetchall()
    return serialize_rows(rows)


def register_routes(app: Flask) -> None:
    @app.get('/')
    def index() -> str:
        return render_template('index.html', **fetch_all())

    @app.get('/api/content')
    def api_content() -> Any:
        return jsonify(fetch_all())

    @app.post('/api/messages')
    def api_messages() -> Any:
        incoming_payload = request.get_json(silent=True) if request.is_json else None
        raw_payload = incoming_payload if isinstance(incoming_payload, dict) else request.form.to_dict()
        submission, errors = validate_submission(raw_payload)

        if errors:
            return jsonify(
                {
                    'ok': False,
                    'message': 'Проверьте форму: заполните имя, контакт и сообщение.',
                    'errors': errors,
                }
            ), 400

        db = get_db()
        try:
            db.execute(
                'INSERT INTO submissions (name, contact, message) VALUES (?, ?, ?)',
                (submission['name'], submission['contact'], submission['message']),
            )
            db.commit()
        except sqlite3.DatabaseError:
            db.rollback()
            current_app.logger.exception('Failed to save contact form submission')
            return jsonify(
                {
                    'ok': False,
                    'message': 'Не удалось сохранить сообщение. Попробуйте ещё раз.',
                }
            ), 500

        return jsonify({'ok': True, 'message': 'Сообщение сохранено в базе данных.'}), 201

    @app.get('/api/admin/messages')
    def admin_messages_api() -> Any:
        return jsonify(fetch_submissions())

    @app.get('/admin/messages')
    def admin_messages() -> Any:
        messages = fetch_submissions()
        return render_template('admin_messages.html', messages=messages, total=len(messages))


app = create_app()


if __name__ == '__main__':
    app.run(
        debug=app.config['DEBUG'],
        host=app.config['HOST'],
        port=app.config['PORT'],
    )
