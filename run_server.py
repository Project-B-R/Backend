from __future__ import annotations

import os

from waitress import serve

from app import app


if __name__ == '__main__':
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('PORT', '8000'))
    threads = int(os.getenv('WAITRESS_THREADS', '4'))

    serve(app, host=host, port=port, threads=threads)
