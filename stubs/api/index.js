require('dotenv').config()

const { Router } = require('express')

const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')

const authRouter = require('./auth')
const checkinsRouter = require('./checkins')
const diaryRouter = require('./diary')
const petRouter = require('./pet')
const insightsRouter = require('./insights')
const promptsRouter = require('./prompts')
const subscriptionsRouter = require('./subsctiptions')
const preferencesRouter = require('./preferences')

const router = Router()

// Swagger UI
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Emotion Diary API Documentation'
}))

// API Routes
router.use('/auth', authRouter)
router.use('/checkins', checkinsRouter)
router.use('/diary', diaryRouter)
router.use('/pet', petRouter)
router.use('/insights', insightsRouter)
router.use('/prompts', promptsRouter)
router.use('/subscriptions', subscriptionsRouter)
router.use('/preferences', preferencesRouter)

// 404 handler
router.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Маршрут не найден'
  })
})

module.exports = router
