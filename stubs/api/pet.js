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
 * /pet:
 *   get:
 *     summary: Получить состояние питомца
 *     tags: [Pet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Состояние питомца
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id

    // Get or create pet
    let result = await pool.query(
      'SELECT * FROM pets WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      // Create default pet
      const createResult = await pool.query(
        `INSERT INTO pets (user_id, name, pet_type, happiness_level)
         VALUES ($1, 'Мой питомец', 'mood_cat', 50)
         RETURNING *`,
        [userId]
      )
      result = createResult
    }

    const pet = result.rows[0]

    // Calculate happiness decay (decrease by 1 per day since last feed)
    const lastFed = new Date(pet.last_fed_at)
    const now = new Date()
    const daysSinceFed = Math.floor((now - lastFed) / (1000 * 60 * 60 * 24))

    if (daysSinceFed > 0 && pet.happiness_level > 0) {
      const newHappiness = Math.max(0, pet.happiness_level - daysSinceFed)
      await pool.query(
        'UPDATE pets SET happiness_level = $1 WHERE id = $2',
        [newHappiness, pet.id]
      )
      pet.happiness_level = newHappiness
    }

    res.json({
      ok: true,
      pet
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /pet/feed:
 *   post:
 *     summary: Покормить питомца
 *     tags: [Pet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Питомец накормлен
 */
router.post('/feed', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id

    // Get pet
    const petResult = await pool.query(
      'SELECT * FROM pets WHERE user_id = $1',
      [userId]
    )

    if (petResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Питомец не найден'
      })
    }

    const pet = petResult.rows[0]

    // Increase happiness (max 100)
    const newHappiness = Math.min(100, pet.happiness_level + 10)

    // Update pet
    const result = await pool.query(
      `UPDATE pets 
       SET happiness_level = $1, last_fed_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [newHappiness, pet.id]
    )

    // Log interaction
    await pool.query(
      'INSERT INTO pet_interactions (pet_id, interaction_type) VALUES ($1, $2)',
      [pet.id, 'fed']
    )

    res.json({
      ok: true,
      pet: result.rows[0],
      message: 'Питомец накормлен! 🍎'
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /pet/pet:
 *   post:
 *     summary: Погладить питомца
 *     tags: [Pet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Питомец поглажен
 */
router.post('/pet', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id

    // Get pet
    const petResult = await pool.query(
      'SELECT * FROM pets WHERE user_id = $1',
      [userId]
    )

    if (petResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Питомец не найден'
      })
    }

    const pet = petResult.rows[0]

    // Increase happiness slightly (max 100)
    const newHappiness = Math.min(100, pet.happiness_level + 5)

    // Update pet
    const result = await pool.query(
      `UPDATE pets 
       SET happiness_level = $1
       WHERE id = $2
       RETURNING *`,
      [newHappiness, pet.id]
    )

    // Log interaction
    await pool.query(
      'INSERT INTO pet_interactions (pet_id, interaction_type) VALUES ($1, $2)',
      [pet.id, 'petted']
    )

    res.json({
      ok: true,
      pet: result.rows[0],
      message: 'Питомец доволен! 😊'
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /pet/talk:
 *   post:
 *     summary: Поговорить с питомцем
 *     tags: [Pet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Сообщение для питомца
 *                 example: "Привет, как дела?"
 *     responses:
 *       200:
 *         description: Ответ питомца
 */
router.post('/talk', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id
    const { message } = req.body

    if (!message) {
      return res.status(400).json({
        ok: false,
        message: 'message обязателен'
      })
    }

    // Get pet
    const petResult = await pool.query(
      'SELECT * FROM pets WHERE user_id = $1',
      [userId]
    )

    if (petResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Питомец не найден'
      })
    }

    const pet = petResult.rows[0]

    // Log interaction
    await pool.query(
      'INSERT INTO pet_interactions (pet_id, interaction_type) VALUES ($1, $2)',
      [pet.id, 'talked_to']
    )

    // Generate response based on pet happiness
    let response
    if (pet.happiness_level >= 80) {
      response = 'Я очень счастлив! Спасибо, что заботишься обо мне! 😊'
    } else if (pet.happiness_level >= 50) {
      response = 'Мне хорошо, но можно было бы лучше. Может покормишь меня? 🐾'
    } else if (pet.happiness_level >= 20) {
      response = 'Мне грустно... Я хочу есть и внимания 😢'
    } else {
      response = 'Мне очень плохо... Пожалуйста, позаботься обо мне! 😭'
    }

    // Increase happiness slightly for interaction
    const newHappiness = Math.min(100, pet.happiness_level + 2)
    await pool.query(
      'UPDATE pets SET happiness_level = $1 WHERE id = $2',
      [newHappiness, pet.id]
    )

    res.json({
      ok: true,
      response,
      pet: {
        ...pet,
        happiness_level: newHappiness
      }
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /pet/name:
 *   put:
 *     summary: Переименовать питомца
 *     tags: [Pet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Новое имя питомца
 *                 example: "Барсик"
 *     responses:
 *       200:
 *         description: Имя обновлено
 */
router.put('/name', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id
    const { name } = req.body

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'name обязателен и не может быть пустым'
      })
    }

    if (name.length > 100) {
      return res.status(400).json({
        ok: false,
        message: 'Имя не может быть длиннее 100 символов'
      })
    }

    // Get pet
    const petResult = await pool.query(
      'SELECT * FROM pets WHERE user_id = $1',
      [userId]
    )

    if (petResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Питомец не найден'
      })
    }

    // Update name
    const result = await pool.query(
      'UPDATE pets SET name = $1 WHERE id = $2 RETURNING *',
      [name.trim(), petResult.rows[0].id]
    )

    res.json({
      ok: true,
      pet: result.rows[0],
      message: 'Имя питомца обновлено!'
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /pet/customize:
 *   post:
 *     summary: Изменить внешний вид питомца (Premium)
 *     tags: [Pet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cosmetic_skin
 *             properties:
 *               cosmetic_skin:
 *                 type: string
 *                 description: Название скина
 *                 example: "rainbow"
 *     responses:
 *       200:
 *         description: Внешний вид обновлен
 *       403:
 *         description: Требуется Premium подписка
 */
router.post('/customize', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id
    const { cosmetic_skin } = req.body

    // Check premium status
    if (req.user.tier === 'free') {
      return res.status(403).json({
        ok: false,
        message: 'Изменение внешнего вида доступно только для Premium подписчиков'
      })
    }

    if (!cosmetic_skin) {
      return res.status(400).json({
        ok: false,
        message: 'cosmetic_skin обязателен'
      })
    }

    // Get pet
    const petResult = await pool.query(
      'SELECT * FROM pets WHERE user_id = $1',
      [userId]
    )

    if (petResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Питомец не найден'
      })
    }

    // Update cosmetic
    const result = await pool.query(
      'UPDATE pets SET cosmetic_skin = $1 WHERE id = $2 RETURNING *',
      [cosmetic_skin, petResult.rows[0].id]
    )

    res.json({
      ok: true,
      pet: result.rows[0],
      message: 'Внешний вид питомца обновлен!'
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router

