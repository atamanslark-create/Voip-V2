# 🚀 Быстрый старт

## Установка за 1 минуту

### На локальной машине

```bash
# Клонировать проект
git clone https://github.com/atamanslark-create/voip-v2.git
cd voip-v2

# Сделать скрипт исполняемым и запустить
chmod +x install.sh
./install.sh
```

Готово! Система доступна по адресам:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

### На VPS

```bash
# Подключиться к VPS
ssh user@your-vps.com

# Установить Docker (если не установлен)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Клонировать и установить
git clone https://github.com/atamanslark-create/voip-v2.git
cd voip-v2
chmod +x install.sh
sudo ./install.sh
```

## Данные для входа

```
Email:    admin@example.com
Password: password

Email:    manager@example.com
Password: password

Email:    telephonist@example.com
Password: password
```

## Основные команды

```bash
# Просмотр логов
docker-compose logs -f

# Перезагрузить систему
docker-compose restart

# Остановить систему
docker-compose down

# Запустить систему
docker-compose up -d

# Очистить (внимание!)
docker-compose down -v
```

## Что дальше?

1. **Настроить Telegram бота**
   - Создать бота в @BotFather
   - Скопировать токен в .env файл
   - Перезагрузить систему: `docker-compose restart`

2. **Добавить пользователей**
   - Зайти в Admin Panel
   - Создать новых пользователей
   - Назначить SIP линии

3. **Создать SIP линии**
   - В Admin Panel → SIP Lines
   - Добавить линии
   - Присвоить им цвета и пользователей

4. **Начать работу**
   - Менеджер: создает ошибки
   - Телефонист: обрабатывает ошибки
   - Админ: управляет всем

## Решение проблем

### "Port already in use"
```bash
# Найти процесс, занимающий порт
lsof -i :3000
# Завершить процесс
kill -9 <PID>
```

### "Database connection error"
```bash
# Проверить БД
docker-compose logs postgres
# Пересоздать БД
docker-compose down -v postgres
docker-compose up -d postgres
```

### Telegram bot не работает
```bash
# Проверить токен в .env
cat .env | grep TELEGRAM

# Просмотреть логи бота
docker-compose logs bot
```

## Документация

- [Полное руководство](README.md)
- [Развертывание на VPS](DEPLOYMENT.md)
- [API документация](API.md) (скоро)

---

**Вопросы?** Создайте issue в репозитории!
