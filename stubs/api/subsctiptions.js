const { Router } = require('express')
const { Pool } = require('pg')
const { authMiddleware } = require('./auth')
const router = Router()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://emotion_diary:dev_password@localhost:5432/emotion_diary',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Stripe configuration (would be imported from config in production)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_...'
// In production, you would use: const stripe = require('stripe')(STRIPE_SECRET_KEY)

/**
 * @swagger
 * /subscriptions/create:
 *   post:
 *     summary: Создать подписку (Stripe)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tier
 *               - payment_method_id
 *             properties:
 *               tier:
 *                 type: string
 *                 enum: [premium, premium_annual]
 *                 description: Тип подписки
 *                 example: "premium"
 *               payment_method_id:
 *                 type: string
 *                 description: ID метода оплаты Stripe
 *                 example: "pm_1234567890"
 *     responses:
 *       201:
 *         description: Подписка создана
 *       400:
 *         description: Неверные данные
 */
router.post('/create', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id
    const { tier, payment_method_id } = req.body

    if (!tier || !['premium', 'premium_annual'].includes(tier)) {
      return res.status(400).json({
        ok: false,
        message: 'tier должен быть "premium" или "premium_annual"'
      })
    }

    if (!payment_method_id) {
      return res.status(400).json({
        ok: false,
        message: 'payment_method_id обязателен'
      })
    }

    // In production, you would:
    // 1. Create Stripe customer if not exists
    // 2. Create Stripe subscription
    // 3. Store subscription ID in database
    // For now, we'll simulate this

    // Check if user already has active subscription
    const existingSub = await pool.query(
      `SELECT * FROM subscriptions
       WHERE user_id = $1 
         AND tier IN ('premium', 'premium_annual')
         AND (end_date IS NULL OR end_date >= CURRENT_DATE)
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    )

    if (existingSub.rows.length > 0) {
      return res.status(400).json({
        ok: false,
        message: 'У вас уже есть активная подписка'
      })
    }

    // Calculate end date
    const startDate = new Date()
    const endDate = new Date()
    if (tier === 'premium') {
      endDate.setMonth(endDate.getMonth() + 1) // 1 month
    } else if (tier === 'premium_annual') {
      endDate.setFullYear(endDate.getFullYear() + 1) // 1 year
    }

    // Create subscription record
    // In production, stripe_subscription_id would come from Stripe API
    const subscriptionResult = await pool.query(
      `INSERT INTO subscriptions (user_id, tier, start_date, end_date, payment_method, stripe_subscription_id)
       VALUES ($1, $2, $3, $4, 'stripe', $5)
       RETURNING *`,
      [userId, tier, startDate, endDate, `sub_${Date.now()}`] // Simulated subscription ID
    )

    // Update user's subscription tier
    await pool.query(
      `UPDATE users 
       SET subscription_tier = $1, subscription_expires_at = $2
       WHERE id = $3`,
      [tier, endDate, userId]
    )

    res.status(201).json({
      ok: true,
      subscription: {
        id: subscriptionResult.rows[0].id,
        tier: subscriptionResult.rows[0].tier,
        start_date: subscriptionResult.rows[0].start_date,
        end_date: subscriptionResult.rows[0].end_date,
        stripe_subscription_id: subscriptionResult.rows[0].stripe_subscription_id
      },
      message: 'Подписка успешно создана!'
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /subscriptions/status:
 *   get:
 *     summary: Получить статус текущей подписки
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статус подписки
 */
router.get('/status', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id

    // Get user's current subscription
    const userResult = await pool.query(
      'SELECT subscription_tier, subscription_expires_at FROM users WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Пользователь не найден'
      })
    }

    const user = userResult.rows[0]

    // Get active subscription
    const subscriptionResult = await pool.query(
      `SELECT * FROM subscriptions
       WHERE user_id = $1 
         AND tier IN ('premium', 'premium_annual')
         AND (end_date IS NULL OR end_date >= CURRENT_DATE)
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    )

    const isActive = subscriptionResult.rows.length > 0
    const subscription = subscriptionResult.rows[0] || null

    // Check if subscription is expired
    let isExpired = false
    if (user.subscription_expires_at) {
      isExpired = new Date(user.subscription_expires_at) < new Date()
    }

    res.json({
      ok: true,
      subscription: {
        tier: user.subscription_tier,
        is_active: isActive && !isExpired,
        expires_at: user.subscription_expires_at,
        details: subscription ? {
          id: subscription.id,
          tier: subscription.tier,
          start_date: subscription.start_date,
          end_date: subscription.end_date,
          payment_method: subscription.payment_method
        } : null
      }
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /subscriptions/cancel:
 *   post:
 *     summary: Отменить подписку
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Подписка отменена
 */
router.post('/cancel', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id

    // Get active subscription
    const subscriptionResult = await pool.query(
      `SELECT * FROM subscriptions
       WHERE user_id = $1 
         AND tier IN ('premium', 'premium_annual')
         AND (end_date IS NULL OR end_date >= CURRENT_DATE)
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    )

    if (subscriptionResult.rows.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Активная подписка не найдена'
      })
    }

    const subscription = subscriptionResult.rows[0]

    // In production, you would:
    // 1. Cancel subscription in Stripe
    // 2. Handle webhook for cancellation confirmation
    // For now, we'll just mark it as cancelled

    // Update subscription end_date to today (immediate cancellation)
    // Or keep it until the end of the billing period (cancellation at period end)
    const cancelAtPeriodEnd = req.body.cancel_at_period_end !== false // Default: cancel at period end

    if (cancelAtPeriodEnd) {
      // Keep subscription active until end_date
      // Just mark it for cancellation (would need a flag in DB)
      res.json({
        ok: true,
        message: 'Подписка будет отменена в конце текущего периода',
        subscription: {
          id: subscription.id,
          end_date: subscription.end_date
        }
      })
    } else {
      // Immediate cancellation
      await pool.query(
        `UPDATE subscriptions 
         SET end_date = CURRENT_DATE
         WHERE id = $1`,
        [subscription.id]
      )

      // Update user tier
      await pool.query(
        `UPDATE users 
         SET subscription_tier = 'free', subscription_expires_at = CURRENT_DATE
         WHERE id = $1`,
        [userId]
      )

      res.json({
        ok: true,
        message: 'Подписка отменена',
        subscription: {
          id: subscription.id,
          end_date: new Date().toISOString().split('T')[0]
        }
      })
    }
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /subscriptions/webhook:
 *   post:
 *     summary: Webhook для обработки событий Stripe
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook обработан
 */
router.post('/webhook', async (req, res, next) => {
  try {
    // In production, you would:
    // 1. Verify webhook signature from Stripe
    // 2. Handle different event types (subscription.created, subscription.updated, subscription.deleted, payment.succeeded, etc.)
    // 3. Update database accordingly

    const event = req.body

    // Example: Handle subscription.created
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object
      const userId = subscription.metadata.user_id // You would store user_id in metadata when creating subscription

      if (userId) {
        // Update subscription in database
        await pool.query(
          `UPDATE subscriptions 
           SET stripe_subscription_id = $1, tier = $2
           WHERE user_id = $3`,
          [subscription.id, subscription.items.data[0].price.nickname || 'premium', userId]
        )
      }
    }

    // Example: Handle subscription.deleted
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const userId = subscription.metadata.user_id

      if (userId) {
        // Cancel subscription
        await pool.query(
          `UPDATE subscriptions 
           SET end_date = CURRENT_DATE
           WHERE stripe_subscription_id = $1`,
          [subscription.id]
        )

        await pool.query(
          `UPDATE users 
           SET subscription_tier = 'free', subscription_expires_at = CURRENT_DATE
           WHERE id = $1`,
          [userId]
        )
      }
    }

    res.json({ received: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router

