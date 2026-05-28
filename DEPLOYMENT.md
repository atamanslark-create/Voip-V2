# Руководство развертывания на VPS

## Пошаговое развертывание

### Шаг 1: Подготовка VPS

```bash
# Обновить систему
sudo apt update && sudo apt upgrade -y

# Установить необходимые пакеты
sudo apt install -y curl git

# Установить Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавить текущего пользователя в группу docker
sudo usermod -aG docker $USER
newgrp docker

# Установить Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Проверить установку
docker --version
docker-compose --version
```

### Шаг 2: Клонирование проекта

```bash
# Создать директорию для приложения
mkdir -p /home/voip-app
cd /home/voip-app

# Клонировать репозиторий
git clone https://github.com/atamanslark-create/voip-v2.git .

# Перейти в директорию проекта
cd voip-v2
```

### Шаг 3: Настройка переменных окружения

```bash
# Скопировать пример конфигурации
cp .env.production .env

# Отредактировать переменные
nano .env
```

Необходимо установить:
- `TELEGRAM_BOT_TOKEN` - токен вашего Telegram бота
- `DB_PASSWORD` - пароль для базы данных
- `JWT_SECRET` - генерируется автоматически, но можно изменить
- `CORS_ORIGIN` - ваш домен

### Шаг 4: Запуск приложения

```bash
# Сделать скрипт установки исполняемым
chmod +x install.sh

# Запустить установку
./install.sh
```

Скрипт автоматически:
1. Проверит наличие Docker
2. Создаст файл конфигурации
3. Соберет образы
4. Запустит контейнеры
5. Инициализирует базу данных

### Шаг 5: Проверка статуса

```bash
# Просмотреть статус контейнеров
docker-compose ps

# Просмотреть логи
docker-compose logs -f

# Проверить доступность
curl http://localhost:5000/health
```

## Настройка DNS и SSL (Let's Encrypt)

### Шаг 1: Установить Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Шаг 2: Установить Nginx

```bash
sudo apt install -y nginx
```

### Шаг 3: Настроить Nginx

Создать файл `/etc/nginx/sites-available/voip`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активировать конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/voip /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Шаг 4: Получить SSL сертификат

```bash
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com
```

### Шаг 5: Автоматическое обновление сертификата

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Резервное копирование

### Автоматическое ежедневное резервное копирование

Создать скрипт `/home/voip-app/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/home/voip-app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/voip_backup_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

# Создать резервную копию базы данных
docker-compose exec -T postgres pg_dump -U voip_user voip_db | gzip > $BACKUP_FILE

# Удалить старые резервные копии (старше 7 дней)
find $BACKUP_DIR -name "voip_backup_*.sql.gz" -mtime +7 -delete

echo "✓ Резервная копия создана: $BACKUP_FILE"
```

Добавить в crontab:

```bash
# Редактировать crontab
crontab -e

# Добавить строку для ежедневного резервного копирования в 2:00 ночи
0 2 * * * /home/voip-app/backup.sh >> /home/voip-app/backup.log 2>&1
```

## Мониторинг и логирование

### Просмотр логов

```bash
# Логи всех сервисов
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f bot
docker-compose logs -f postgres
```

### Настройка сохранения логов

Отредактировать `docker-compose.yml`:

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Обновление приложения

```bash
# Остановить текущие контейнеры
docker-compose down

# Обновить код
git pull origin main

# Пересобрать образы
docker-compose build

# Запустить приложение
docker-compose up -d
```

## Стандартные команды управления

```bash
# Перезагрузить приложение
docker-compose restart

# Пересоздать контейнеры
docker-compose up -d --force-recreate

# Очистить всё (внимание!)
docker-compose down -v

# Получить доступ в БД
docker-compose exec postgres psql -U voip_user -d voip_db

# Просмотр использования ресурсов
docker stats
```

## Решение проблем

### 1. Порты заняты

```bash
# Найти процесс, использующий порт
sudo lsof -i :5000

# Завершить процесс
sudo kill -9 <PID>
```

### 2. Ошибки подключения к БД

```bash
# Проверить статус PostgreSQL контейнера
docker-compose logs postgres

# Пересоздать БД
docker-compose down -v postgres
docker-compose up -d postgres
```

### 3. Телеграм бот не отправляет сообщения

```bash
# Проверить логи бота
docker-compose logs bot

# Проверить переменные окружения
docker-compose config | grep TELEGRAM
```

### 4. Высокое использование памяти

```bash
# Проверить использование ресурсов
docker stats

# Перезагрузить контейнер
docker-compose restart <service-name>
```

## Производительность

### Оптимизация для большого количества пользователей

1. **Увеличить пулинг подключений PostgreSQL:**
   
   ```sql
   -- В контейнере postgres:
   max_connections = 200
   shared_buffers = 256MB
   ```

2. **Добавить кеширование Redis** (опционально)

3. **Использовать LoadBalancer для multiple instances**

## Мониторинг здоровья системы

Скрипт проверки (`/home/voip-app/health-check.sh`):

```bash
#!/bin/bash

echo "🔍 Проверка здоровья системы..."

# Проверка API
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✓ Backend API работает"
else
    echo "✗ Backend API не отвечает"
fi

# Проверка frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✓ Frontend работает"
else
    echo "✗ Frontend не отвечает"
fi

# Проверка базы данных
if docker-compose exec -T postgres pg_isready -U voip_user > /dev/null; then
    echo "✓ PostgreSQL работает"
else
    echo "✗ PostgreSQL не отвечает"
fi

# Статус контейнеров
echo ""
echo "📊 Статус контейнеров:"
docker-compose ps
```

Добавить в crontab для периодической проверки:

```bash
*/5 * * * * /home/voip-app/health-check.sh >> /home/voip-app/health-check.log 2>&1
```

---

После выполнения всех шагов приложение будет доступно по адресу вашего домена!
