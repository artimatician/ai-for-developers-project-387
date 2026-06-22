FROM python:3.11-slim AS base-deps

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    nginx \
    supervisor \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

FROM base-deps AS build

COPY . .
RUN cd frontend && npm ci && npm run build
RUN mkdir -p /app/out && \
    cp -r frontend/.next/standalone/. /app/out/ && \
    cp -r frontend/.next/static /app/out/.next/static && \
    cp -r frontend/public /app/out/public

FROM base-deps AS prod

ENV PORT=8080

COPY --from=build /app/out/ /app/
COPY --from=build /app/backend /app/backend
COPY docker/nginx.conf /etc/nginx/sites-enabled/default
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /app/backend
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
