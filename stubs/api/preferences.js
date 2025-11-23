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

/**
 * @swagger
 * /preferences:
 *   get:
 *     summary: Получить настройки пользователя
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Настройки пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     user_id:
 *                       type: integer
 *                     theme:
 *                       type: string
 *                       enum: [light, dark, auto]
 *                       example: "light"
 *                     notifications_enabled:
 *                       type: boolean
 *                       example: true
 *                     notification_time:
 *                       type: string
 *                       example: "09:00"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Неавторизован
 *       404:
 *         description: Настройки не найдены
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id

    // Get preferences or create default
    let result = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    )

    // If no preferences exist, create default
    if (result.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO user_preferences (user_id, theme, notifications_enabled)
         VALUES ($1, 'light', true)
         RETURNING *`,
        [userId]
      )
    }

    const preferences = result.rows[0]

    res.json({
      ok: true,
      preferences
    })
  } catch (err) {
    console.error('[Preferences API] Error fetching preferences:', err)
    next(err)
  }
})

/**
 * @swagger
 * /preferences:
 *   put:
 *     summary: Обновить настройки пользователя
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark, auto]
 *                 description: Тема интерфейса
 *                 example: "dark"
 *               notifications_enabled:
 *                 type: boolean
 *                 description: Включены ли уведомления
 *                 example: true
 *               notification_time:
 *                 type: string
 *                 description: Время уведомления (формат HH:MM)
 *                 example: "09:00"
 *     responses:
 *       200:
 *         description: Настройки обновлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 preferences:
 *                   type: object
 *       400:
 *         description: Неверные данные
 *       401:
 *         description: Неавторизован
 */
router.put('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id
    const { theme, notifications_enabled, notification_time } = req.body

    // Validation
    if (theme && !['light', 'dark', 'auto'].includes(theme)) {
      return res.status(400).json({
        ok: false,
        message: 'theme должен быть light, dark или auto'
      })
    }

    if (notifications_enabled !== undefined && typeof notifications_enabled !== 'boolean') {
      return res.status(400).json({
        ok: false,
        message: 'notifications_enabled должен быть boolean'
      })
    }

    if (notification_time && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(notification_time)) {
      return res.status(400).json({
        ok: false,
        message: 'notification_time должен быть в формате HH:MM'
      })
    }

    // Build update query dynamically based on provided fields
    const updates = []
    const values = []
    let paramCount = 1

    if (theme !== undefined) {
      updates.push(`theme = $${paramCount}`)
      values.push(theme)
      paramCount++
    }

    if (notifications_enabled !== undefined) {
      updates.push(`notifications_enabled = $${paramCount}`)
      values.push(notifications_enabled)
      paramCount++
    }

    if (notification_time !== undefined) {
      updates.push(`notification_time = $${paramCount}`)
      values.push(notification_time)
      paramCount++
    }

    if (updates.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Нет данных для обновления'
      })
    }

    updates.push(`updated_at = NOW()`)
    values.push(userId)

    // Check if preferences exist
    const checkResult = await pool.query(
      'SELECT id FROM user_preferences WHERE user_id = $1',
      [userId]
    )

    let result

    if (checkResult.rows.length === 0) {
      // Create new preferences
      const insertFields = ['user_id']
      const insertPlaceholders = ['$1']
      const insertValues = [userId]
      let insertParamCount = 2

      if (theme !== undefined) {
        insertFields.push('theme')
        insertPlaceholders.push(`$${insertParamCount}`)
        insertValues.push(theme)
        insertParamCount++
      }

      if (notifications_enabled !== undefined) {
        insertFields.push('notifications_enabled')
        insertPlaceholders.push(`$${insertParamCount}`)
        insertValues.push(notifications_enabled)
        insertParamCount++
      }

      if (notification_time !== undefined) {
        insertFields.push('notification_time')
        insertPlaceholders.push(`$${insertParamCount}`)
        insertValues.push(notification_time)
        insertParamCount++
      }

      result = await pool.query(
        `INSERT INTO user_preferences (${insertFields.join(', ')})
         VALUES (${insertPlaceholders.join(', ')})
         RETURNING *`,
        insertValues
      )
    } else {
      // Update existing preferences
      result = await pool.query(
        `UPDATE user_preferences
         SET ${updates.join(', ')}
         WHERE user_id = $${paramCount}
         RETURNING *`,
        values
      )
    }

    const preferences = result.rows[0]

    res.json({
      ok: true,
      preferences
    })
  } catch (err) {
    console.error('[Preferences API] Error updating preferences:', err)
    next(err)
  }
})

module.exports = router
