# Инструкция по запуску API и Swagger

## Запуск API

API автоматически запускается вместе с фронтендом через `brojs`. Для запуска выполните:

```bash
npm start
```

Сервер запустится на порту **8099** и автоматически откроет браузер.

## Доступ к API

API доступен по адресу: `http://localhost:8099/api`

### Доступные эндпоинты:

- **Auth**: `/api/auth` - аутентификация и регистрация
  - `POST /api/auth` - регистрация нового пользователя
  - `POST /api/auth/login` - авторизация

- **Books**: `/api/books` - управление книгами
  - `GET /api/books` - получить список книг
  - `POST /api/books` - добавить новую книгу

- **Analytics**: `/api/analytics` - аналитика
  - `GET /api/analytics` - получить аналитические данные

- **Agent**: `/api/agent` - AI агент
  - `POST /api/agent/prompt` - отправить сообщение AI агенту

## Swagger документация

После запуска сервера, Swagger UI доступен по адресу:

**http://localhost:8099/api/api-docs**

В Swagger UI вы можете:
- Просмотреть все доступные эндпоинты
- Увидеть схемы запросов и ответов
- Протестировать API прямо из браузера (Try it out)

## Структура проекта

- `stubs/api/` - все API роуты
  - `index.js` - главный роутер с подключением Swagger
  - `swagger.js` - конфигурация Swagger
  - `auth.js` - роуты аутентификации
  - `books.js` - роуты для книг
  - `analytics.js` - роуты аналитики
  - `agent.js` - роуты AI агента

## Примеры использования

### Регистрация пользователя
```bash
curl -X POST http://localhost:8099/api/auth \
  -H "Content-Type: application/json" \
  -d '{"login": "user123", "password": "pass123", "email": "user@example.com"}'
```

### Авторизация
```bash
curl -X POST http://localhost:8099/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "nikita", "password": "123"}'
```

### Добавление книги
```bash
curl -X POST http://localhost:8099/api/books \
  -H "Content-Type: application/json" \
  -d '{"name": "Война и мир", "author": "Лев Толстой", "fileLink": "https://example.com/book.pdf"}'
```

### Запрос к AI агенту
```bash
curl -X POST http://localhost:8099/api/agent/prompt \
  -H "Content-Type: application/json" \
  -d '{"message": "Какая погода в Москве?"}'
```

