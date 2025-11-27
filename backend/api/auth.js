const { Router } = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { Pool } = require('pg')
const router = Router()

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://emotion_diary:dev_password@localhost:5432/emotion_diary',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

// Middleware: Verify JWT token (can be used in other routes)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      message: 'Токен авторизации отсутствует'
    })
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)

  if (!decoded) {
    return res.status(401).json({
      ok: false,
      message: 'Неверный или истекший токен'
    })
  }

  // Attach user info to request
  req.user = {
    id: decoded.sub,
    email: decoded.email,
    tier: decoded.tier
  }

  next()
}

// Helper: Generate JWT token
const generateToken = (userId, email, tier = 'free') => {
  return jwt.sign(
    { sub: userId, email, tier, iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

// Helper: Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { sub: userId, type: 'refresh', iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  )
}

// Helper: Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email пользователя
 *                 example: "user@example.com"
 *               username:
 *                 type: string
 *                 description: Имя пользователя
 *                 example: "user123"
 *               password:
 *                 type: string
 *                 description: Пароль пользователя (минимум 6 символов)
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Успешная регистрация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     subscription_tier:
 *                       type: string
 *       400:
 *         description: Неправильные данные
 *       409:
 *         description: Пользователь уже существует
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password } = req.body

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Email, username и password обязательны'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: 'Пароль должен содержать минимум 6 символов'
      })
    }

    if (username.length < 3) {
      return res.status(400).json({
        ok: false,
        message: 'Username должен содержать минимум 3 символа'
      })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        ok: false,
        message: 'Неверный формат email'
      })
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    )

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        message: 'Пользователь с таким email или username уже существует'
      })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash, subscription_tier)
       VALUES ($1, $2, $3, 'free')
       RETURNING id, email, username, subscription_tier, created_at`,
      [email, username, passwordHash]
    )

    const user = result.rows[0]

    // Generate tokens
    const token = generateToken(user.id, user.email, user.subscription_tier)
    const refreshToken = generateRefreshToken(user.id)

    res.status(201).json({
      ok: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        subscription_tier: user.subscription_tier
      }
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email пользователя
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: Пароль пользователя
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Неверные учетные данные
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Email и password обязательны'
      })
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, username, password_hash, subscription_tier FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        ok: false,
        message: 'Неверный email или пароль'
      })
    }

    const user = result.rows[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return res.status(401).json({
        ok: false,
        message: 'Неверный email или пароль'
      })
    }

    // Generate tokens
    const token = generateToken(user.id, user.email, user.subscription_tier)
    const refreshToken = generateRefreshToken(user.id)

    res.json({
      ok: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        subscription_tier: user.subscription_tier
      }
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Обновление JWT токена
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: Токен обновлен
 *       401:
 *         description: Неверный refresh token
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        ok: false,
        message: 'Refresh token обязателен'
      })
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken)

    if (!decoded || decoded.type !== 'refresh') {
      return res.status(401).json({
        ok: false,
        message: 'Неверный refresh token'
      })
    }

    // Get user data
    const result = await pool.query(
      'SELECT id, email, subscription_tier FROM users WHERE id = $1',
      [decoded.sub]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        ok: false,
        message: 'Пользователь не найден'
      })
    }

    const user = result.rows[0]

    // Generate new tokens
    const token = generateToken(user.id, user.email, user.subscription_tier)
    const newRefreshToken = generateRefreshToken(user.id)

    res.json({
      ok: true,
      token,
      refreshToken: newRefreshToken
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Выход из системы
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный выход
 */
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    // In a production system, you would invalidate the refresh token
    // by storing it in a blacklist (Redis) or marking it as used in the database
    // For now, we'll just return success
    res.json({
      ok: true,
      message: 'Выход выполнен успешно'
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Получить профиль пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Профиль пользователя
 *       401:
 *         description: Неавторизован
 */
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id

    const result = await pool.query(
      'SELECT id, email, username, subscription_tier, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Пользователь не найден'
      })
    }

    const user = result.rows[0]

    res.json({
      ok: true,
      user
    })
  } catch (err) {
    console.error('[Auth API] Error getting profile:', err)
    next(err)
  }
})

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Обновить профиль пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Новое имя пользователя
 *                 example: "newusername"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Новый email
 *                 example: "newemail@example.com"
 *     responses:
 *       200:
 *         description: Профиль обновлен успешно
 *       400:
 *         description: Неверные данные
 *       401:
 *         description: Неавторизован
 *       409:
 *         description: Email уже используется
 */
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id
    const { username, email } = req.body

    if (!username && !email) {
      return res.status(400).json({
        ok: false,
        message: 'Необходимо указать username или email'
      })
    }

    // Build update query
    const updates = []
    const values = []
    let paramCount = 1

    if (username) {
      if (username.length < 3) {
        return res.status(400).json({
          ok: false,
          message: 'Username должен содержать минимум 3 символа'
        })
      }
      updates.push(`username = $${paramCount}`)
      values.push(username)
      paramCount++
    }

    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          ok: false,
          message: 'Неверный формат email'
        })
      }

      // Check if email is already taken
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      )

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({
          ok: false,
          message: 'Email уже используется'
        })
      }

      updates.push(`email = $${paramCount}`)
      values.push(email)
      paramCount++
    }

    updates.push(`updated_at = NOW()`)
    values.push(userId)

    const result = await pool.query(
      `UPDATE users
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, email, username, subscription_tier, created_at, updated_at`,
      values
    )

    const user = result.rows[0]

    res.json({
      ok: true,
      user
    })
  } catch (err) {
    console.error('[Auth API] Error updating profile:', err)
    next(err)
  }
})

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Изменить пароль пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 description: Текущий пароль
 *                 example: "oldpassword123"
 *               new_password:
 *                 type: string
 *                 description: Новый пароль (минимум 6 символов)
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Пароль изменен успешно
 *       400:
 *         description: Неверные данные
 *       401:
 *         description: Неверный текущий пароль
 */
router.post('/change-password', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id
    const { current_password, new_password } = req.body

    if (!current_password || !new_password) {
      return res.status(400).json({
        ok: false,
        message: 'Необходимо указать current_password и new_password'
      })
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: 'Новый пароль должен содержать минимум 6 символов'
      })
    }

    // Get current password hash
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Пользователь не найден'
      })
    }

    const user = userResult.rows[0]

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, user.password_hash)

    if (!isValidPassword) {
      return res.status(401).json({
        ok: false,
        message: 'Неверный текущий пароль'
      })
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(new_password, 10)

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    )

    res.json({
      ok: true,
      message: 'Пароль изменен успешно'
    })
  } catch (err) {
    console.error('[Auth API] Error changing password:', err)
    next(err)
  }
})

/**
 * @swagger
 * /auth/account:
 *   delete:
 *     summary: Удалить аккаунт пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: Пароль для подтверждения удаления
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Аккаунт удален успешно
 *       400:
 *         description: Неверные данные
 *       401:
 *         description: Неверный пароль
 */
router.delete('/account', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id
    const { password } = req.body

    if (!password) {
      return res.status(400).json({
        ok: false,
        message: 'Необходимо указать пароль для подтверждения'
      })
    }

    // Get user password hash
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Пользователь не найден'
      })
    }

    const user = userResult.rows[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return res.status(401).json({
        ok: false,
        message: 'Неверный пароль'
      })
    }

    // Delete all user data (cascade should handle this)
    await pool.query('DELETE FROM users WHERE id = $1', [userId])

    res.json({
      ok: true,
      message: 'Аккаунт удален успешно'
    })
  } catch (err) {
    console.error('[Auth API] Error deleting account:', err)
    next(err)
  }
})

/**
 * @swagger
 * /auth/export-data:
 *   get:
 *     summary: Экспортировать данные пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     preferences:
 *                       type: object
 *                     checkins:
 *                       type: array
 *                     diary_entries:
 *                       type: array
 *                     pet:
 *                       type: object
 *       401:
 *         description: Неавторизован
 */
router.get('/export-data', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id

    // Fetch all user data
    const userResult = await pool.query(
      'SELECT id, email, username, subscription_tier, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    )

    const preferencesResult = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    )

    const checkinsResult = await pool.query(
      `SELECT mc.*, e.name as emotion_name, e.emoji as emotion_emoji 
       FROM mood_checkins mc 
       LEFT JOIN emotions e ON mc.emotion_id = e.id 
       WHERE mc.user_id = $1 
       ORDER BY mc.created_at DESC`,
      [userId]
    )

    const diaryResult = await pool.query(
      `SELECT de.*, 
       ARRAY_AGG(DISTINCT t.name) as tags,
       ARRAY_AGG(DISTINCT t.emoji) as tag_emojis
       FROM diary_entries de
       LEFT JOIN diary_entry_tags det ON de.id = det.entry_id
       LEFT JOIN tags t ON det.tag_id = t.id
       WHERE de.user_id = $1 
       GROUP BY de.id
       ORDER BY de.created_at DESC`,
      [userId]
    )

    const petResult = await pool.query(
      'SELECT * FROM pets WHERE user_id = $1',
      [userId]
    )

    const streakResult = await pool.query(
      'SELECT * FROM user_streaks WHERE user_id = $1',
      [userId]
    )

    const insightsResult = await pool.query(
      'SELECT * FROM emotional_insights WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )

    const reflectionsResult = await pool.query(
      `SELECT rr.*, rp.prompt 
       FROM reflection_responses rr 
       LEFT JOIN reflection_prompts rp ON rr.prompt_id = rp.id 
       WHERE rr.user_id = $1 
       ORDER BY rr.created_at DESC`,
      [userId]
    )

    res.json({
      ok: true,
      data: {
        user: userResult.rows[0] || null,
        preferences: preferencesResult.rows[0] || null,
        checkins: checkinsResult.rows || [],
        diary_entries: diaryResult.rows || [],
        pet: petResult.rows[0] || null,
        streak: streakResult.rows[0] || null,
        insights: insightsResult.rows || [],
        reflections: reflectionsResult.rows || [],
        exported_at: new Date().toISOString()
      }
    })
  } catch (err) {
    console.error('[Auth API] Error exporting data:', err)
    next(err)
  }
})

// Export router and middleware
module.exports = router
module.exports.authMiddleware = authMiddleware
