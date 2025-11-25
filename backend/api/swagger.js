const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Emotion Diary API',
      version: '1.0.0',
      description: 'API для системы дневника эмоций и отслеживания настроения',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:8099/api',
        description: 'Локальный сервер разработки',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Эндпоинты для аутентификации и регистрации',
      },
      {
        name: 'Checkins',
        description: 'Эндпоинты для записи настроения',
      },
      {
        name: 'Diary',
        description: 'Эндпоинты для работы с дневником',
      },
      {
        name: 'Pet',
        description: 'Эндпоинты для взаимодействия с виртуальным питомцем',
      },
      {
        name: 'Insights',
        description: 'Эндпоинты для получения аналитики и инсайтов (Premium)',
      },
      {
        name: 'Prompts',
        description: 'Эндпоинты для работы с промптами для размышлений',
      },
      {
        name: 'Subscriptions',
        description: 'Эндпоинты для управления подписками',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [path.join(__dirname, '**/*.js')], // Путь к файлам с аннотациями
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

