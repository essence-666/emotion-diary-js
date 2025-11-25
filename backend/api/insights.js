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
 * /insights/weekly:
 *   get:
 *     summary: Получить недельную сводку эмоций (Premium)
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Недельная сводка
 *       403:
 *         description: Требуется Premium подписка
 */
router.get('/weekly', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id

    // Check premium status
    if (req.user.tier === 'free') {
      return res.status(403).json({
        ok: false,
        message: 'Недельные инсайты доступны только для Premium подписчиков'
      })
    }

    // Get checkins from last 7 days
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const checkinsResult = await pool.query(
      `SELECT 
        mc.emotion_id,
        mc.intensity,
        mc.reflection_text,
        mc.created_at,
        e.name as emotion_name,
        e.emoji as emotion_emoji
       FROM mood_checkins mc
       JOIN emotions e ON mc.emotion_id = e.id
       WHERE mc.user_id = $1 AND mc.created_date >= $2
       ORDER BY mc.created_at DESC`,
      [userId, weekAgo.toISOString().split('T')[0]]
    )

    // Calculate statistics
    const emotionCounts = {}
    let totalIntensity = 0
    let totalCheckins = checkinsResult.rows.length

    checkinsResult.rows.forEach(checkin => {
      if (!emotionCounts[checkin.emotion_name]) {
        emotionCounts[checkin.emotion_name] = {
          count: 0,
          totalIntensity: 0,
          emoji: checkin.emotion_emoji
        }
      }
      emotionCounts[checkin.emotion_name].count++
      emotionCounts[checkin.emotion_name].totalIntensity += checkin.intensity
      totalIntensity += checkin.intensity
    })

    const emotionStats = Object.entries(emotionCounts).map(([name, data]) => ({
      emotion: name,
      emoji: data.emoji,
      count: data.count,
      avg_intensity: (data.totalIntensity / data.count).toFixed(2),
      percentage: ((data.count / totalCheckins) * 100).toFixed(1)
    }))

    // Get or generate AI insight
    const insightResult = await pool.query(
      `SELECT * FROM emotional_insights
       WHERE user_id = $1 
         AND insight_type = 'weekly_summary'
         AND period_start_date >= $2
       ORDER BY generated_at DESC
       LIMIT 1`,
      [userId, weekAgo.toISOString().split('T')[0]]
    )

    let aiSummary = null
    if (insightResult.rows.length > 0) {
      aiSummary = insightResult.rows[0].content
    } else {
      // Generate simple summary (in production, this would call Gigachat API)
      const dominantEmotion = emotionStats.sort((a, b) => b.count - a.count)[0]
      aiSummary = `На этой неделе вы чаще всего испытывали ${dominantEmotion.emotion} (${dominantEmotion.count} раз). `
      
      if (totalCheckins >= 5) {
        aiSummary += 'Вы активно отслеживаете свои эмоции - это отличная практика! '
      }
      
      if (emotionStats.some(e => e.emotion === 'stressed' && e.count >= 3)) {
        aiSummary += 'Замечено несколько случаев стресса - возможно, стоит обратить внимание на техники релаксации.'
      }
    }

    res.json({
      ok: true,
      period: {
        start: weekAgo.toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      statistics: {
        total_checkins: totalCheckins,
        avg_intensity: totalCheckins > 0 ? (totalIntensity / totalCheckins).toFixed(2) : 0,
        emotion_distribution: emotionStats
      },
      ai_summary: aiSummary
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /insights/triggers:
 *   get:
 *     summary: Получить анализ триггеров эмоций (Premium)
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Анализ триггеров
 *       403:
 *         description: Требуется Premium подписка
 */
router.get('/triggers', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id

    // Check premium status
    if (req.user.tier === 'free') {
      return res.status(403).json({
        ok: false,
        message: 'Анализ триггеров доступен только для Premium подписчиков'
      })
    }

    // Get checkins from last 30 days with reflections
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)

    const checkinsResult = await pool.query(
      `SELECT 
        mc.emotion_id,
        mc.intensity,
        mc.reflection_text,
        mc.created_at,
        EXTRACT(HOUR FROM mc.created_at) as hour_of_day,
        EXTRACT(DOW FROM mc.created_at) as day_of_week,
        e.name as emotion_name
       FROM mood_checkins mc
       JOIN emotions e ON mc.emotion_id = e.id
       WHERE mc.user_id = $1 
         AND mc.created_date >= $2
         AND mc.reflection_text IS NOT NULL
       ORDER BY mc.created_at DESC`,
      [userId, monthAgo.toISOString().split('T')[0]]
    )

    // Analyze patterns
    const timePatterns = {}
    const dayPatterns = {}
    const emotionTriggers = {}

    checkinsResult.rows.forEach(checkin => {
      const hour = parseInt(checkin.hour_of_day)
      const dayOfWeek = parseInt(checkin.day_of_week)
      const emotion = checkin.emotion_name

      // Time patterns
      const timeSlot = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
      if (!timePatterns[timeSlot]) {
        timePatterns[timeSlot] = {}
      }
      if (!timePatterns[timeSlot][emotion]) {
        timePatterns[timeSlot][emotion] = 0
      }
      timePatterns[timeSlot][emotion]++

      // Day patterns
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
      if (!dayPatterns[dayName]) {
        dayPatterns[dayName] = {}
      }
      if (!dayPatterns[dayName][emotion]) {
        dayPatterns[dayName][emotion] = 0
      }
      dayPatterns[dayName][emotion]++

      // Extract keywords from reflections (simple approach)
      if (checkin.reflection_text) {
        const words = checkin.reflection_text.toLowerCase().split(/\s+/)
        words.forEach(word => {
          if (word.length > 4) { // Filter short words
            if (!emotionTriggers[emotion]) {
              emotionTriggers[emotion] = {}
            }
            if (!emotionTriggers[emotion][word]) {
              emotionTriggers[emotion][word] = 0
            }
            emotionTriggers[emotion][word]++
          }
        })
      }
    })

    // Get or generate AI insight
    const insightResult = await pool.query(
      `SELECT * FROM emotional_insights
       WHERE user_id = $1 
         AND insight_type = 'mood_trigger'
         AND period_start_date >= $2
       ORDER BY generated_at DESC
       LIMIT 1`,
      [userId, monthAgo.toISOString().split('T')[0]]
    )

    let aiAnalysis = null
    if (insightResult.rows.length > 0) {
      aiAnalysis = insightResult.rows[0].content
    } else {
      // Generate simple analysis
      const topTimeSlot = Object.entries(timePatterns)
        .map(([slot, emotions]) => ({
          slot,
          total: Object.values(emotions).reduce((a, b) => a + b, 0)
        }))
        .sort((a, b) => b.total - a.total)[0]

      aiAnalysis = `Анализ показывает, что большинство эмоций регистрируется в ${topTimeSlot?.slot || 'разное время'}. `
      aiAnalysis += 'Попробуйте отслеживать, что происходит в это время дня, чтобы лучше понимать свои эмоциональные паттерны.'
    }

    res.json({
      ok: true,
      period_days: 30,
      patterns: {
        time_of_day: timePatterns,
        day_of_week: dayPatterns
      },
      triggers: Object.entries(emotionTriggers).map(([emotion, words]) => ({
        emotion,
        common_words: Object.entries(words)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([word, count]) => ({ word, count }))
      })),
      ai_analysis: aiAnalysis
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /insights/recommendations:
 *   get:
 *     summary: Получить персональные рекомендации (Premium)
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Рекомендации
 *       403:
 *         description: Требуется Premium подписка
 */
router.get('/recommendations', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id

    // Check premium status
    if (req.user.tier === 'free') {
      return res.status(403).json({
        ok: false,
        message: 'Персональные рекомендации доступны только для Premium подписчиков'
      })
    }

    // Get recent checkins and insights
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)

    const checkinsResult = await pool.query(
      `SELECT 
        mc.emotion_id,
        mc.intensity,
        e.name as emotion_name
       FROM mood_checkins mc
       JOIN emotions e ON mc.emotion_id = e.id
       WHERE mc.user_id = $1 AND mc.created_date >= $2`,
      [userId, monthAgo.toISOString().split('T')[0]]
    )

    // Analyze for recommendations
    const emotionCounts = {}
    checkinsResult.rows.forEach(checkin => {
      if (!emotionCounts[checkin.emotion_name]) {
        emotionCounts[checkin.emotion_name] = 0
      }
      emotionCounts[checkin.emotion_name]++
    })

    const recommendations = []

    // Check for stress
    if (emotionCounts['stressed'] && emotionCounts['stressed'] >= 5) {
      recommendations.push({
        type: 'stress_management',
        priority: 'high',
        title: 'Управление стрессом',
        description: 'Вы часто испытываете стресс. Рекомендуем попробовать техники дыхания или медитацию.',
        action: 'Попробуйте ежедневную практику осознанности на 10 минут'
      })
    }

    // Check for sadness
    if (emotionCounts['sad'] && emotionCounts['sad'] >= 5) {
      recommendations.push({
        type: 'mood_boost',
        priority: 'medium',
        title: 'Поднятие настроения',
        description: 'Замечено несколько случаев грусти. Попробуйте активные занятия или общение с близкими.',
        action: 'Запланируйте приятное занятие на эту неделю'
      })
    }

    // Check consistency
    const totalCheckins = checkinsResult.rows.length
    if (totalCheckins < 10) {
      recommendations.push({
        type: 'consistency',
        priority: 'low',
        title: 'Регулярность отслеживания',
        description: 'Попробуйте делать записи о настроении каждый день для более точных инсайтов.',
        action: 'Установите напоминание на ежедневную проверку настроения'
      })
    }

    // Get or generate AI recommendations
    const insightResult = await pool.query(
      `SELECT * FROM emotional_insights
       WHERE user_id = $1 
         AND insight_type = 'recommendation'
         AND period_start_date >= $2
       ORDER BY generated_at DESC
       LIMIT 1`,
      [userId, monthAgo.toISOString().split('T')[0]]
    )

    let aiRecommendations = []
    if (insightResult.rows.length > 0) {
      // Parse AI recommendations (in production, this would be structured JSON from Gigachat)
      aiRecommendations = [{
        type: 'ai_generated',
        priority: 'medium',
        title: 'Персональная рекомендация',
        description: insightResult.rows[0].content,
        action: 'Следуйте рекомендациям для улучшения эмоционального благополучия'
      }]
    }

    res.json({
      ok: true,
      recommendations: [...recommendations, ...aiRecommendations],
      based_on: {
        period_days: 30,
        total_checkins: totalCheckins
      }
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router

