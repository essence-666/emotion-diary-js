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
 * /checkins:
 *   post:
 *     summary: Создать запись о настроении
 *     tags: [Checkins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emotion_id
 *               - intensity
 *             properties:
 *               emotion_id:
 *                 type: integer
 *                 description: ID эмоции (1-6)
 *                 example: 1
 *               intensity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Интенсивность эмоции (1-10)
 *                 example: 7
 *               reflection_text:
 *                 type: string
 *                 description: Опциональный текст размышления (50-500 символов)
 *                 example: "Сегодня был хороший день"
 *     responses:
 *       201:
 *         description: Запись создана успешно
 *       400:
 *         description: Неверные данные
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { emotion_id, intensity, reflection_text } = req.body
    const userId = req.user.id

    // Validation
    if (!emotion_id || !intensity) {
      return res.status(400).json({
        ok: false,
        message: 'emotion_id и intensity обязательны'
      })
    }

    if (intensity < 1 || intensity > 10) {
      return res.status(400).json({
        ok: false,
        message: 'intensity должен быть от 1 до 10'
      })
    }

    if (reflection_text && (reflection_text.length < 50 || reflection_text.length > 500)) {
      return res.status(400).json({
        ok: false,
        message: 'reflection_text должен содержать от 50 до 500 символов'
      })
    }

    // Verify emotion exists
    const emotionCheck = await pool.query(
      'SELECT id FROM emotions WHERE id = $1',
      [emotion_id]
    )

    if (emotionCheck.rows.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Эмоция с таким ID не найдена'
      })
    }

    // Create checkin
    const result = await pool.query(
      `INSERT INTO mood_checkins (user_id, emotion_id, intensity, reflection_text, created_date)
       VALUES ($1, $2, $3, $4, CURRENT_DATE)
       RETURNING id, emotion_id, intensity, reflection_text, created_at, created_date`,
      [userId, emotion_id, intensity, reflection_text || null]
    )

    const checkin = result.rows[0]

    // Update streak
    await updateStreak(userId)

    res.status(201).json({
      ok: true,
      checkin
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /checkins:
 *   get:
 *     summary: Получить записи о настроении пользователя
 *     tags: [Checkins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Количество записей на странице
 *     responses:
 *       200:
 *         description: Список записей
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit

    const result = await pool.query(
      `SELECT 
        mc.id, 
        mc.emotion_id, 
        mc.intensity, 
        mc.reflection_text, 
        mc.created_at, 
        mc.created_date,
        e.name as emotion_name,
        e.emoji as emotion_emoji,
        e.color_hex as emotion_color
       FROM mood_checkins mc
       JOIN emotions e ON mc.emotion_id = e.id
       WHERE mc.user_id = $1
       ORDER BY mc.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    )

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM mood_checkins WHERE user_id = $1',
      [userId]
    )

    res.json({
      ok: true,
      checkins: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /checkins/daily/{date}:
 *   get:
 *     summary: Получить записи за конкретную дату
 *     tags: [Checkins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Дата в формате YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Список записей за дату
 */
router.get('/daily/:date', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id
    const { date } = req.params

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        ok: false,
        message: 'Неверный формат даты. Используйте YYYY-MM-DD'
      })
    }

    const result = await pool.query(
      `SELECT 
        mc.id, 
        mc.emotion_id, 
        mc.intensity, 
        mc.reflection_text, 
        mc.created_at, 
        mc.created_date,
        e.name as emotion_name,
        e.emoji as emotion_emoji,
        e.color_hex as emotion_color
       FROM mood_checkins mc
       JOIN emotions e ON mc.emotion_id = e.id
       WHERE mc.user_id = $1 AND mc.created_date = $2
       ORDER BY mc.created_at DESC`,
      [userId, date]
    )

    res.json({
      ok: true,
      date,
      checkins: result.rows
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /checkins/stats:
 *   get:
 *     summary: Получить статистику по эмоциям (Premium)
 *     tags: [Checkins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Количество дней для анализа
 *     responses:
 *       200:
 *         description: Статистика по эмоциям
 *       403:
 *         description: Требуется Premium подписка
 */
router.get('/stats', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id
    const days = parseInt(req.query.days) || 7

    // Check premium status
    if (req.user.tier === 'free') {
      return res.status(403).json({
        ok: false,
        message: 'Эта функция доступна только для Premium подписчиков'
      })
    }

    // Get emotion distribution
    const result = await pool.query(
      `SELECT 
        e.id,
        e.name,
        e.emoji,
        e.color_hex,
        COUNT(mc.id) as count,
        AVG(mc.intensity) as avg_intensity
       FROM emotions e
       LEFT JOIN mood_checkins mc ON e.id = mc.emotion_id 
         AND mc.user_id = $1 
         AND mc.created_date >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY e.id, e.name, e.emoji, e.color_hex
       ORDER BY count DESC`,
      [userId]
    )

    // Get total checkins
    const totalResult = await pool.query(
      `SELECT COUNT(*) as total
       FROM mood_checkins
       WHERE user_id = $1 AND created_date >= CURRENT_DATE - INTERVAL '${days} days'`,
      [userId]
    )

    res.json({
      ok: true,
      period_days: days,
      total_checkins: parseInt(totalResult.rows[0].total),
      emotion_distribution: result.rows.map(row => ({
        emotion_id: row.id,
        emotion_name: row.name,
        emotion_emoji: row.emoji,
        emotion_color: row.color_hex,
        count: parseInt(row.count),
        avg_intensity: row.avg_intensity ? parseFloat(row.avg_intensity).toFixed(2) : 0
      }))
    })
  } catch (err) {
    next(err)
  }
})

// Helper: Update user streak
async function updateStreak(userId) {
  try {
    // Get last checkin date
    const lastCheckin = await pool.query(
      'SELECT created_date FROM mood_checkins WHERE user_id = $1 ORDER BY created_date DESC LIMIT 1',
      [userId]
    )

    if (lastCheckin.rows.length === 0) return

    const today = new Date().toISOString().split('T')[0]
    const lastDate = lastCheckin.rows[0].created_date.toISOString().split('T')[0]

    // Get current streak
    const streakResult = await pool.query(
      'SELECT * FROM user_streaks WHERE user_id = $1',
      [userId]
    )

    if (streakResult.rows.length === 0) {
      // Create new streak record
      await pool.query(
        `INSERT INTO user_streaks (user_id, current_checkin_streak, longest_checkin_streak, streak_start_date, last_checkin_date)
         VALUES ($1, 1, 1, CURRENT_DATE, CURRENT_DATE)`,
        [userId]
      )
    } else {
      const streak = streakResult.rows[0]
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      let newStreak = streak.current_checkin_streak

      if (lastDate === today) {
        // Same day - no change
        return
      } else if (lastDate === yesterdayStr) {
        // Consecutive day - increment streak
        newStreak = streak.current_checkin_streak + 1
      } else {
        // Streak broken - reset
        newStreak = 1
        await pool.query(
          'UPDATE user_streaks SET streak_broken_count = streak_broken_count + 1 WHERE user_id = $1',
          [userId]
        )
      }

      const longestStreak = Math.max(newStreak, streak.longest_checkin_streak)

      await pool.query(
        `UPDATE user_streaks 
         SET current_checkin_streak = $1,
             longest_checkin_streak = $2,
             last_checkin_date = CURRENT_DATE,
             streak_start_date = CASE WHEN $1 = 1 THEN CURRENT_DATE ELSE streak_start_date END
         WHERE user_id = $3`,
        [newStreak, longestStreak, userId]
      )
    }
  } catch (err) {
    console.error('Error updating streak:', err)
  }
}

module.exports = router

