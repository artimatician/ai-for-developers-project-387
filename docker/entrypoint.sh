#!/bin/bash
set -e

mkdir -p /data
cd /app/backend

PORT="${PORT:-8080}"
sed -i "s/__PORT__/$PORT/g" /etc/nginx/sites-enabled/default

python manage.py migrate --run-syncdb

if [ -f /data/db.sqlite3 ]; then
  python -c "
import sqlite3
conn = sqlite3.connect('/data/db.sqlite3')
conn.executescript('''
  PRAGMA journal_mode=WAL;
  PRAGMA synchronous=NORMAL;
  PRAGMA journal_size_limit=65536;
''')
conn.close()
"
fi

export API_URL="${API_URL:-http://localhost:4010}"

echo "Starting supervisord..."
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
