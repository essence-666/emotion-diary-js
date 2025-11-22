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
 * /diary:
 *   get:
 *     summary: Получить записи дневника
 *     tags: [Diary]
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
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
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
    const tagIds = req.query.tags ? req.query.tags.split(',').map(id => parseInt(id.trim())) : []

    let query = `
      SELECT DISTINCT
        de.id,
        de.title,
        de.content,
        de.source_checkin_ids,
        de.created_at,
        de.updated_at,
        de.entry_date,
        de.is_private,
        de.ai_summary
      FROM diary_entries de
    `

    const queryParams = [userId]
    let paramIndex = 1

    if (tagIds.length > 0) {
      query += `
        INNER JOIN diary_entry_tags det ON de.id = det.entry_id
        WHERE de.user_id = $${paramIndex++}
        AND det.tag_id = ANY($${paramIndex++})
      `
      queryParams.push(tagIds)
    } else {
      query += ` WHERE de.user_id = $${paramIndex++}`
    }

    query += ` ORDER BY de.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
    queryParams.push(limit, offset)

    const result = await pool.query(query, queryParams)

    // Get tags for each entry
    const entries = await Promise.all(
      result.rows.map(async (entry) => await getEntryWithTags(entry.id))
    )

    // Get total count
    let countQuery = 'SELECT COUNT(DISTINCT de.id) FROM diary_entries de'
    const countParams = [userId]
    let countParamIndex = 1

    if (tagIds.length > 0) {
      countQuery += ' INNER JOIN diary_entry_tags det ON de.id = det.entry_id'
      countQuery += ` WHERE de.user_id = $${countParamIndex++} AND det.tag_id = ANY($${countParamIndex++})`
      countParams.push(tagIds)
    } else {
      countQuery += ` WHERE de.user_id = $${countParamIndex++}`
    }

    const countResult = await pool.query(countQuery, countParams)

    res.json({
      ok: true,
      entries,
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
 * /diary:
 *   post:
 *     summary: Создать запись в дневнике
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: Заголовок записи
 *                 example: "День первый"
 *               content:
 *                 type: string
 *                 description: Содержание записи
 *                 example: "Сегодня был замечательный день..."
 *               tag_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Массив ID тегов
 *                 example: [1, 2, 3]
 *               source_checkin_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Массив ID checkins, которые сгенерировали эту запись
 *     responses:
 *       201:
 *         description: Запись создана успешно
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { title, content, tag_ids = [], source_checkin_ids = [] } = req.body
    const userId = req.user.id

    if (!content) {
      return res.status(400).json({
        ok: false,
        message: 'content обязателен'
      })
    }

    // Create diary entry
    const result = await pool.query(
      `INSERT INTO diary_entries (user_id, title, content, source_checkin_ids, entry_date)
       VALUES ($1, $2, $3, $4, CURRENT_DATE)
       RETURNING id, title, content, source_checkin_ids, created_at, updated_at, entry_date`,
      [userId, title || null, content, source_checkin_ids]
    )

    const entry = result.rows[0]

    // Add tags if provided
    if (tag_ids.length > 0) {
      for (const tagId of tag_ids) {
        await pool.query(
          'INSERT INTO diary_entry_tags (entry_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [entry.id, tagId]
        )
      }
    }

    // Get entry with tags
    const entryWithTags = await getEntryWithTags(entry.id)

    res.status(201).json({
      ok: true,
      entry: entryWithTags
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /diary/entries/{id}:
 *   put:
 *     summary: Обновить запись дневника
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tag_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Запись обновлена
 *       404:
 *         description: Запись не найдена
 */
router.put('/entries/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const { title, content, tag_ids } = req.body

    // Check if entry exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM diary_entries WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Запись не найдена'
      })
    }

    // Build update query
    const updates = []
    const params = []
    let paramIndex = 1

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      params.push(title)
    }

    if (content !== undefined) {
      updates.push(`content = $${paramIndex++}`)
      params.push(content)
    }

    if (updates.length > 0) {
      updates.push(`updated_at = CURRENT_TIMESTAMP`)
      params.push(id, userId)

      await pool.query(
        `UPDATE diary_entries SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}`,
        params
      )
    }

    // Update tags if provided
    if (tag_ids !== undefined) {
      // Remove all existing tags
      await pool.query('DELETE FROM diary_entry_tags WHERE entry_id = $1', [id])

      // Add new tags
      if (tag_ids.length > 0) {
        for (const tagId of tag_ids) {
          await pool.query(
            'INSERT INTO diary_entry_tags (entry_id, tag_id) VALUES ($1, $2)',
            [id, tagId]
          )
        }
      }
    }

    // Get updated entry
    const entry = await getEntryWithTags(id)

    res.json({
      ok: true,
      entry
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /diary/entries/{id}:
 *   delete:
 *     summary: Удалить запись дневника
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Запись удалена
 *       404:
 *         description: Запись не найдена
 */
router.delete('/entries/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const result = await pool.query(
      'DELETE FROM diary_entries WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Запись не найдена'
      })
    }

    res.json({
      ok: true,
      message: 'Запись удалена успешно'
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /diary/monthly:
 *   get:
 *     summary: Получить данные для месячного календаря (heat map)
 *     tags: [Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *     responses:
 *       200:
 *         description: Данные для календаря
 */
router.get('/monthly', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id
    const year = parseInt(req.query.year) || new Date().getFullYear()
    const month = parseInt(req.query.month) || new Date().getMonth() + 1

    if (month < 1 || month > 12) {
      return res.status(400).json({
        ok: false,
        message: 'Месяц должен быть от 1 до 12'
      })
    }

    // Get entries count per day
    const result = await pool.query(
      `SELECT 
        entry_date,
        COUNT(*) as entry_count,
        COUNT(DISTINCT id) as unique_entries
       FROM diary_entries
       WHERE user_id = $1
         AND EXTRACT(YEAR FROM entry_date) = $2
         AND EXTRACT(MONTH FROM entry_date) = $3
       GROUP BY entry_date
       ORDER BY entry_date`,
      [userId, year, month]
    )

    // Get checkins count per day for the same month
    const checkinsResult = await pool.query(
      `SELECT 
        created_date,
        COUNT(*) as checkin_count
       FROM mood_checkins
       WHERE user_id = $1
         AND EXTRACT(YEAR FROM created_date) = $2
         AND EXTRACT(MONTH FROM created_date) = $3
       GROUP BY created_date
       ORDER BY created_date`,
      [userId, year, month]
    )

    // Combine data
    const heatMapData = {}
    result.rows.forEach(row => {
      const dateStr = row.entry_date.toISOString().split('T')[0]
      heatMapData[dateStr] = {
        entry_count: parseInt(row.entry_count),
        checkin_count: 0
      }
    })

    checkinsResult.rows.forEach(row => {
      const dateStr = row.created_date.toISOString().split('T')[0]
      if (heatMapData[dateStr]) {
        heatMapData[dateStr].checkin_count = parseInt(row.checkin_count)
      } else {
        heatMapData[dateStr] = {
          entry_count: 0,
          checkin_count: parseInt(row.checkin_count)
        }
      }
    })

    res.json({
      ok: true,
      year,
      month,
      heat_map: heatMapData
    })
  } catch (err) {
    next(err)
  }
})

// Helper: Get entry with tags
async function getEntryWithTags(entryId) {
  const entryResult = await pool.query(
    'SELECT * FROM diary_entries WHERE id = $1',
    [entryId]
  )

  if (entryResult.rows.length === 0) {
    return null
  }

  const entry = entryResult.rows[0]

  // Get tags
  const tagsResult = await pool.query(
    `SELECT t.id, t.name, t.category, t.emoji
     FROM tags t
     INNER JOIN diary_entry_tags det ON t.id = det.tag_id
     WHERE det.entry_id = $1`,
    [entryId]
  )

  return {
    ...entry,
    tags: tagsResult.rows
  }
}

module.exports = router

