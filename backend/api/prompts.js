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
      `SELECT rr.id, rr.prompt_id, rr.response, rr.created_at
       FROM reflection_responses rr
       WHERE rr.user_id = $1 AND DATE(rr.created_at) = $2
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
      // Get a random prompt
      const promptResult = await pool.query(
        `SELECT * FROM reflection_prompts
         WHERE id NOT IN (
           SELECT prompt_id FROM reflection_responses 
           WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'
         )
         ORDER BY RANDOM()
         LIMIT 1`,
        [userId]
      )

      if (promptResult.rows.length === 0) {
        // Fallback: get any prompt
        const fallbackResult = await pool.query(
          `SELECT * FROM reflection_prompts
           ORDER BY RANDOM()
           LIMIT 1`
        )
        prompt = fallbackResult.rows[0]
      } else {
        prompt = promptResult.rows[0]
      }
    }

    if (!prompt) {
      // If still no prompt, create a default one
      const defaultPrompt = {
        id: 0,
        prompt: "Как вы себя чувствуете сегодня и почему?",
        created_at: new Date()
      }
      prompt = defaultPrompt
    }

    res.json({
      ok: true,
      prompt: {
        id: prompt.id,
        prompt_text: prompt.prompt,
        created_at: prompt.created_at
      },
      has_responded: existingResponse.rows.length > 0,
      existing_response: existingResponse.rows.length > 0 ? {
        id: existingResponse.rows[0].id,
        response: existingResponse.rows[0].response,
        created_at: existingResponse.rows[0].created_at
      } : null
    })
  } catch (err) {
    console.error('Error in /prompts/daily:', err)
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
 *               - response
 *             properties:
 *               response:
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
    const { response } = req.body

    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'response обязателен'
      })
    }

    // For default prompt (id = 0), we'll use prompt_id = 1
    const actualPromptId = promptId === 0 ? 1 : promptId

    // Verify prompt exists (skip for default prompt)
    if (actualPromptId !== 0) {
      const promptResult = await pool.query(
        'SELECT * FROM reflection_prompts WHERE id = $1',
        [actualPromptId]
      )

      if (promptResult.rows.length === 0) {
        return res.status(404).json({
          ok: false,
          message: 'Промпт не найден'
        })
      }
    }

    // Check if user already responded today
    const today = new Date().toISOString().split('T')[0]
    const existingResponse = await pool.query(
      'SELECT id FROM reflection_responses WHERE user_id = $1 AND prompt_id = $2 AND DATE(created_at) = $3',
      [userId, actualPromptId, today]
    )

    let responseResult
    if (existingResponse.rows.length > 0) {
      // Update existing response
      const updateResult = await pool.query(
        `UPDATE reflection_responses 
         SET response = $1, created_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [response.trim(), existingResponse.rows[0].id]
      )
      responseResult = updateResult.rows[0]
    } else {
      // Create new response
      const createResult = await pool.query(
        `INSERT INTO reflection_responses (user_id, prompt_id, response)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, actualPromptId, response.trim()]
      )
      responseResult = createResult.rows[0]
    }

    res.status(201).json({
      ok: true,
      response: {
        id: responseResult.id,
        prompt_id: responseResult.prompt_id,
        response: responseResult.response,
        created_at: responseResult.created_at
      }
    })
  } catch (err) {
    console.error('Error in /prompts/:id/response:', err)
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
        rr.response,
        rr.created_at,
        rp.prompt as prompt_text
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
          prompt_text: row.prompt_text
        },
        response: row.response,
        created_at: row.created_at
      })),
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    })
  } catch (err) {
    console.error('Error in /prompts/responses:', err)
    next(err)
  }
})

/**
 * @swagger
 * /prompts/random:
 *   get:
 *     summary: Получить случайный промпт
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Случайный промпт
 */
router.get('/random', authMiddleware, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM reflection_prompts 
       ORDER BY RANDOM() 
       LIMIT 1`
    )

    if (result.rows.length === 0) {
      // Return default prompt if no prompts in database
      return res.json({
        ok: true,
        prompt: {
          id: 0,
          prompt_text: "Как вы себя чувствуете сегодня и почему?",
          created_at: new Date()
        }
      })
    }

    const prompt = result.rows[0]

    res.json({
      ok: true,
      prompt: {
        id: prompt.id,
        prompt_text: prompt.prompt,
        created_at: prompt.created_at
      }
    })
  } catch (err) {
    console.error('Error in /prompts/random:', err)
    next(err)
  }
})

/**
 * @swagger
 * /prompts/all:
 *   get:
 *     summary: Получить все промпты
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список всех промптов
 */
router.get('/all', authMiddleware, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM reflection_prompts 
       ORDER BY created_at DESC`
    )

    res.json({
      ok: true,
      prompts: result.rows.map(prompt => ({
        id: prompt.id,
        prompt_text: prompt.prompt,
        created_at: prompt.created_at
      }))
    })
  } catch (err) {
    console.error('Error in /prompts/all:', err)
    next(err)
  }
})

module.exports = router
