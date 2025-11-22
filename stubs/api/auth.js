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

    // Store refresh token (optional: in database or Redis)
    // For now, we'll return it to the client

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
router.post('/logout', async (req, res, next) => {
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

// Export router and middleware
module.exports = router
module.exports.authMiddleware = authMiddleware
