# VoIP Management System

Полнофункциональная веб-система для управления ошибками телефонных линий VoIP с интеграцией Telegram бота.

**Функции:**
- 👥 **3 Роли:** Администратор, Менеджер, Телефонист
- 📱 **Telegram Бот:** Уведомления о новых ошибках и статус изменениях
- 📊 **Статистика:** По линиям и ремонтам
- 🎨 **Темы:** Светлая и темная тема оформления
- 🔔 **Уведомления:** Звуковые и визуальные сигналы
- ⚡ **Docker:** Быстрая установка на VPS

## Быстрая установка

### Требования
- Docker
- Docker Compose

### Установка (1 команда)

```bash
chmod +x install.sh && ./install.sh
```

Скрипт установит все необходимое и запустит систему на:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Database:** PostgreSQL на localhost:5432

### Данные для входа (Demo)

```
Админ:
Email: admin@example.com
Password: password

Менеджер:
Email: manager@example.com
Password: password

Телефонист:
Email: telephonist@example.com
Password: password
```

## Ручная установка (для разработки)

### Требования
- Node.js 20+
- Python 3.11+
- PostgreSQL 16+

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Telegram Bot

```bash
cd bot
pip install -r requirements.txt
python src/main.py
```

## Архитектура

```
┌─────────────────────────────────────────┐
│           Frontend (React)               │
│  Admin | Manager | Telephonist Panel    │
└────────────────┬────────────────────────┘
                 │ HTTP/REST API
┌────────────────▼────────────────────────┐
│         Backend (Express.js)             │
│  Authentication | Users | Tickets       │
│  SIP Lines | Errors | Statistics        │
└────────────────┬────────────────────────┘
                 │ WebSocket + HTTP
┌────────────────▼────────────────────────┐
│      PostgreSQL Database                │
│  Users | SIP Lines | Tickets | Messages │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      Telegram Bot (Python/aiogram)      │
│  Notifications | Ticket Updates         │
│  Manager/Telephonist Communication      │
└─────────────────────────────────────────┘
```

## Функции по ролям

### 👨‍🔧 Администратор
- ✅ Управление пользователями (создание, редактирование, удаление)
- ✅ Управление SIP линиями (добавление, присвоение, изменение цвета)
- ✅ Управление шаблонами ошибок (быстрое редактирование)
- ✅ Просмотр всех билетов и статистики
- ✅ Переназначение пользователей и линий
- ✅ Настройка Telegram бота

### 👨‍💼 Менеджер
- ✅ Создание билетов ошибок по SIP линиям
- ✅ Выбор шаблонов ошибок
- ✅ Чат с телефонистами
- ✅ Просмотр статистики по ремонтам
- ✅ Визуальные и звуковые уведомления о смене статуса
- ✅ Темная/светлая тема

### 🧑‍💼 Телефонист
- ✅ Просмотр назначенных SIP линий
- ✅ Прием заявок
- ✅ Изменение статуса ремонта
- ✅ Добавление комментариев
- ✅ Чат с менеджером/админом
- ✅ Звуковые и визуальные уведомления
- ✅ Выбор пользовательских звуков оповещения

## API Endpoints

### Аутентификация
```
POST   /api/auth/register      - Регистрация пользователя
POST   /api/auth/login         - Вход в систему
```

### Пользователи
```
GET    /api/users              - Получить всех пользователей (только админ)
POST   /api/users              - Создать пользователя (только админ)
PUT    /api/users/:id          - Обновить пользователя (только админ)
DELETE /api/users/:id          - Удалить пользователя (только админ)
```

### SIP Линии
```
GET    /api/sip-lines          - Получить все линии
GET    /api/sip-lines/:id      - Получить линию по ID
POST   /api/sip-lines          - Создать линию (администратор/менеджер)
PUT    /api/sip-lines/:id      - Обновить линию (администратор/менеджер)
DELETE /api/sip-lines/:id      - Удалить линию (только админ)
```

### Билеты
```
GET    /api/tickets            - Получить все билеты (с фильтрацией)
POST   /api/tickets            - Создать билет (менеджер/администратор)
PUT    /api/tickets/:id        - Обновить билет (изменить статус)
```

### Статистика
```
GET    /api/statistics         - Получить общую статистику
```

## Telegram Bot Команды

```
/start      - Начать работу с ботом
/tickets    - Просмотр моих билетов
/help       - Справка по использованию
```

## Docker Команды

### Запуск
```bash
docker-compose up -d
```

### Остановка
```bash
docker-compose down
```

### Просмотр логов
```bash
docker-compose logs -f
```

### Перестроение образов
```bash
docker-compose build --no-cache
```

### Доступ в базу данных
```bash
docker-compose exec postgres psql -U voip_user -d voip_db
```

## Развертывание на VPS

### 1. Подключиться к VPS
```bash
ssh user@your-vps.com
```

### 2. Установить Docker и Docker Compose
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Клонировать репозиторий
```bash
git clone https://github.com/atamanslark-create/voip-v2.git
cd voip-v2
```

### 4. Запустить установку
```bash
chmod +x install.sh
./install.sh
```

### 5. Настроить Nginx (опционально)

Создать `/etc/nginx/sites-available/voip`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Активировать:
```bash
sudo ln -s /etc/nginx/sites-available/voip /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

## Переменные окружения

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://voip_user:password@localhost:5432/voip_db
JWT_SECRET=your-secure-secret-key
TELEGRAM_BOT_TOKEN=your-bot-token
BOT_API_URL=http://localhost:5001
CORS_ORIGIN=https://your-domain.com
```

### Bot (.env)
```env
TELEGRAM_BOT_TOKEN=your-bot-token
DATABASE_URL=postgresql://voip_user:password@localhost:5432/voip_db
API_URL=http://backend:5000/api
BOT_API_PORT=5001
```

## Проблемы и решения

### Порты уже заняты
```bash
# Изменить порты в docker-compose.yml
# Или освободить порты:
lsof -i :5000
kill -9 <PID>
```

### Проблемы с базой данных
```bash
# Очистить и пересоздать БД:
docker-compose down -v
docker-compose up -d
```

### Telegram Bot не отправляет сообщения
- Проверить токен бота в .env
- Проверить логи: `docker-compose logs bot`

## Разработка

### Структура проекта
```
voip-v2/
├── backend/           # Express.js API
├── frontend/          # React приложение
├── bot/              # Telegram bot (Python)
├── docker-compose.yml # Docker конфигурация
└── install.sh        # Скрипт установки
```

### Запуск в dev режиме
```bash
# Терминал 1 - Backend
cd backend
npm install && npm run dev

# Терминал 2 - Frontend
cd frontend
npm install && npm run dev

# Терминал 3 - Bot
cd bot
pip install -r requirements.txt
python src/main.py
```

## Лицензия

MIT

## Поддержка

Для вопросов и проблем создайте issue в репозитории.
