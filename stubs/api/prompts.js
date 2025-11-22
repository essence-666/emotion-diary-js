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
 * /prompts/daily:
 *   get:
 *     summary: Получить ежедневный промпт для размышления
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ежедневный промпт
 */
router.get('/daily', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id
    const today = new Date().toISOString().split('T')[0]

    // Check if user already responded to today's prompt
    const existingResponse = await pool.query(
      `SELECT rr.id, rr.prompt_id, rr.response_text, rr.response_date
       FROM reflection_responses rr
       WHERE rr.user_id = $1 AND rr.response_date = $2
       ORDER BY rr.created_at DESC
       LIMIT 1`,
      [userId, today]
    )

    let prompt
    if (existingResponse.rows.length > 0) {
      // Get the prompt that was already answered
      const promptResult = await pool.query(
        'SELECT * FROM reflection_prompts WHERE id = $1',
        [existingResponse.rows[0].prompt_id]
      )
      prompt = promptResult.rows[0]
    } else {
      // Get a random prompt (or contextual based on user's recent emotions)
      // For now, get a random non-premium prompt or premium if user is premium
      const tierFilter = req.user.tier === 'free' 
        ? "AND is_premium = false" 
        : ""

      const promptResult = await pool.query(
        `SELECT * FROM reflection_prompts
         WHERE id NOT IN (
           SELECT prompt_id FROM reflection_responses 
           WHERE user_id = $1 AND response_date >= CURRENT_DATE - INTERVAL '7 days'
         )
         ${tierFilter}
         ORDER BY RANDOM()
         LIMIT 1`,
        [userId]
      )

      if (promptResult.rows.length === 0) {
        // Fallback: get any prompt
        const fallbackResult = await pool.query(
          `SELECT * FROM reflection_prompts
           ${tierFilter ? `WHERE ${tierFilter.replace('AND ', '')}` : ''}
           ORDER BY RANDOM()
           LIMIT 1`
        )
        prompt = fallbackResult.rows[0]
      } else {
        prompt = promptResult.rows[0]
      }
    }

    if (!prompt) {
      return res.status(404).json({
        ok: false,
        message: 'Промпт не найден'
      })
    }

    res.json({
      ok: true,
      prompt: {
        id: prompt.id,
        prompt_text: prompt.prompt_text,
        category: prompt.category,
        is_premium: prompt.is_premium
      },
      has_responded: existingResponse.rows.length > 0,
      existing_response: existingResponse.rows.length > 0 ? {
        id: existingResponse.rows[0].id,
        response_text: existingResponse.rows[0].response_text,
        response_date: existingResponse.rows[0].response_date
      } : null
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /prompts/{id}/response:
 *   post:
 *     summary: Отправить ответ на промпт
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID промпта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response_text
 *             properties:
 *               response_text:
 *                 type: string
 *                 description: Текст ответа
 *                 example: "Сегодня меня вдохновила встреча с друзьями..."
 *     responses:
 *       201:
 *         description: Ответ сохранен
 *       400:
 *         description: Неверные данные
 */
router.post('/:id/response', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id
    const promptId = parseInt(req.params.id)
    const { response_text } = req.body

    if (!response_text || response_text.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'response_text обязателен'
      })
    }

    // Verify prompt exists
    const promptResult = await pool.query(
      'SELECT * FROM reflection_prompts WHERE id = $1',
      [promptId]
    )

    if (promptResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Промпт не найден'
      })
    }

    const prompt = promptResult.rows[0]

    // Check if prompt is premium and user has access
    if (prompt.is_premium && req.user.tier === 'free') {
      return res.status(403).json({
        ok: false,
        message: 'Этот промпт доступен только для Premium подписчиков'
      })
    }

    // Check if user already responded today
    const today = new Date().toISOString().split('T')[0]
    const existingResponse = await pool.query(
      'SELECT id FROM reflection_responses WHERE user_id = $1 AND prompt_id = $2 AND response_date = $3',
      [userId, promptId, today]
    )

    let response
    if (existingResponse.rows.length > 0) {
      // Update existing response
      const updateResult = await pool.query(
        `UPDATE reflection_responses 
         SET response_text = $1, created_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [response_text.trim(), existingResponse.rows[0].id]
      )
      response = updateResult.rows[0]
    } else {
      // Create new response
      const createResult = await pool.query(
        `INSERT INTO reflection_responses (user_id, prompt_id, response_text, response_date)
         VALUES ($1, $2, $3, CURRENT_DATE)
         RETURNING *`,
        [userId, promptId, response_text.trim()]
      )
      response = createResult.rows[0]
    }

    // Optionally create or link to diary entry
    // This could be done automatically or on user request

    res.status(201).json({
      ok: true,
      response: {
        id: response.id,
        prompt_id: response.prompt_id,
        response_text: response.response_text,
        response_date: response.response_date,
        created_at: response.created_at
      }
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /prompts/responses:
 *   get:
 *     summary: Получить ответы пользователя на промпты
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Список ответов
 */
router.get('/responses', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit

    const result = await pool.query(
      `SELECT 
        rr.id,
        rr.prompt_id,
        rr.response_text,
        rr.response_date,
        rr.created_at,
        rr.associated_diary_entry_id,
        rp.prompt_text,
        rp.category
       FROM reflection_responses rr
       JOIN reflection_prompts rp ON rr.prompt_id = rp.id
       WHERE rr.user_id = $1
       ORDER BY rr.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    )

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM reflection_responses WHERE user_id = $1',
      [userId]
    )

    res.json({
      ok: true,
      responses: result.rows.map(row => ({
        id: row.id,
        prompt: {
          id: row.prompt_id,
          prompt_text: row.prompt_text,
          category: row.category
        },
        response_text: row.response_text,
        response_date: row.response_date,
        created_at: row.created_at,
        associated_diary_entry_id: row.associated_diary_entry_id
      })),
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

module.exports = router

