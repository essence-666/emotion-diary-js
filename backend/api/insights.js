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
         AND created_at >= $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, weekAgo]
    )

    let aiSummary = null
    if (insightResult.rows.length > 0) {
      aiSummary = insightResult.rows[0].insight
    } else {
      // Generate simple summary
      if (emotionStats.length > 0) {
        const dominantEmotion = emotionStats.sort((a, b) => b.count - a.count)[0]
        aiSummary = `На этой неделе вы чаще всего испытывали ${dominantEmotion.emotion} ${dominantEmotion.emoji} (${dominantEmotion.count} раз). `
        
        if (totalCheckins >= 5) {
          aiSummary += 'Вы активно отслеживаете свои эмоции - это отличная практика! '
        }
        
        if (emotionStats.some(e => e.emotion.toLowerCase().includes('anxious') && e.count >= 3)) {
          aiSummary += 'Замечено несколько случаев тревоги - возможно, стоит обратить внимание на техники релаксации.'
        } else if (emotionStats.some(e => e.emotion.toLowerCase().includes('sad') && e.count >= 3)) {
          aiSummary += 'Замечено несколько случаев грусти - возможно, стоит уделить время приятным занятиям.'
        }
      } else {
        aiSummary = 'На этой неделе у вас пока нет записей о настроении. Попробуйте делать ежедневные чекины для получения инсайтов.'
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
        e.name as emotion_name,
        e.emoji as emotion_emoji
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
      const dayName = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][dayOfWeek]
      if (!dayPatterns[dayName]) {
        dayPatterns[dayName] = {}
      }
      if (!dayPatterns[dayName][emotion]) {
        dayPatterns[dayName][emotion] = 0
      }
      dayPatterns[dayName][emotion]++

      // Extract keywords from reflections (simple approach)
      if (checkin.reflection_text) {
        const commonTriggers = ['работа', 'дом', 'семья', 'друзья', 'здоровье', 'сон', 'еда', 'погода', 'деньги', 'отдых']
        const words = checkin.reflection_text.toLowerCase().split(/[\s,.!?]+/)
        words.forEach(word => {
          if (word.length > 3 && commonTriggers.includes(word)) {
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

    // Generate AI analysis based on patterns
    let aiAnalysis = null
    
    // Find most active time slot
    const topTimeSlot = Object.entries(timePatterns)
      .map(([slot, emotions]) => ({
        slot,
        total: Object.values(emotions).reduce((a, b) => a + b, 0)
      }))
      .sort((a, b) => b.total - a.total)[0]

    // Find most emotional day
    const topDay = Object.entries(dayPatterns)
      .map(([day, emotions]) => ({
        day,
        total: Object.values(emotions).reduce((a, b) => a + b, 0)
      }))
      .sort((a, b) => b.total - a.total)[0]

    if (topTimeSlot && topDay) {
      aiAnalysis = `Анализ показывает, что большинство эмоций регистрируется ${topDay.day.toLowerCase()} в ${topTimeSlot.slot}. `
      
      // Add specific insights based on triggers
      const topTriggers = Object.entries(emotionTriggers)
        .flatMap(([emotion, words]) => 
          Object.entries(words).map(([word, count]) => ({ emotion, word, count }))
        )
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)

      if (topTriggers.length > 0) {
        aiAnalysis += `Частые триггеры: ${topTriggers.map(t => `${t.word} (${t.emotion})`).join(', ')}. `
      }

      aiAnalysis += 'Попробуйте отслеживать, что происходит в это время, чтобы лучше понимать свои эмоциональные паттерны.'
    } else {
      aiAnalysis = 'Пока недостаточно данных для анализа триггеров. Продолжайте делать записи с описанием причин настроения.'
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

    // Check for stress/anxiety
    const stressCount = emotionCounts['Anxious'] || 0
    if (stressCount >= 5) {
      recommendations.push({
        type: 'stress_management',
        priority: 'high',
        title: 'Управление стрессом',
        description: 'Вы часто испытываете тревогу. Рекомендуем попробовать техники дыхания или медитацию.',
        action: 'Попробуйте ежедневную практику осознанности на 10 минут',
        icon: '🧘'
      })
    }

    // Check for sadness
    const sadCount = emotionCounts['Sad'] || 0
    if (sadCount >= 5) {
      recommendations.push({
        type: 'mood_boost',
        priority: 'medium',
        title: 'Поднятие настроения',
        description: 'Замечено несколько случаев грусти. Попробуйте активные занятия или общение с близкими.',
        action: 'Запланируйте приятное занятие на эту неделю',
        icon: '😊'
      })
    }

    // Check for anger
    const angerCount = emotionCounts['Angry'] || 0
    if (angerCount >= 3) {
      recommendations.push({
        type: 'anger_management',
        priority: 'medium',
        title: 'Управление гневом',
        description: 'Вы несколько раз испытывали гнев. Попробуйте техники паузы и глубокого дыхания.',
        action: 'При чувстве гнева сделайте 3 глубоких вдоха перед реакцией',
        icon: '🌊'
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
        action: 'Установите напоминание на ежедневную проверку настроения',
        icon: '📅'
      })
    }

    // Check for positive emotions
    const happyCount = emotionCounts['Happy'] || 0
    const excitedCount = emotionCounts['Excited'] || 0
    if (happyCount + excitedCount >= 8) {
      recommendations.push({
        type: 'positive_reinforcement',
        priority: 'low',
        title: 'Поддержание позитива',
        description: 'Вы часто испытываете положительные эмоции! Продолжайте практики, которые к этому приводят.',
        action: 'Поделитесь своими методами поддержания позитивного настроения',
        icon: '🌟'
      })
    }

    // Get recent AI insights for additional recommendations
    const insightResult = await pool.query(
      `SELECT insight FROM emotional_insights
       WHERE user_id = $1 AND created_at >= $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, monthAgo]
    )

    if (insightResult.rows.length > 0) {
      recommendations.push({
        type: 'ai_insight',
        priority: 'medium',
        title: 'AI Анализ',
        description: insightResult.rows[0].insight,
        action: 'Учтите это в своей ежедневной практике',
        icon: '🤖'
      })
    }

    // If no specific recommendations, provide general ones
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'general_wellbeing',
        priority: 'low',
        title: 'Общее благополучие',
        description: 'Ваше эмоциональное состояние выглядит стабильным. Продолжайте отслеживать настроение для поддержания баланса.',
        action: 'Продолжайте ежедневную практику осознанности',
        icon: '✅'
      })
    }

    res.json({
      ok: true,
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }),
      based_on: {
        period_days: 30,
        total_checkins: totalCheckins,
        emotions_tracked: Object.keys(emotionCounts).length
      }
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /insights/generate:
 *   post:
 *     summary: Сгенерировать новый AI инсайт (Premium)
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Инсайт сгенерирован
 *       403:
 *         description: Требуется Premium подписка
 */
router.post('/generate', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id

    // Check premium status
    if (req.user.tier === 'free') {
      return res.status(403).json({
        ok: false,
        message: 'Генерация AI инсайтов доступна только для Premium подписчиков'
      })
    }

    // Get recent data for analysis
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)

    const checkinsResult = await pool.query(
      `SELECT 
        mc.emotion_id,
        mc.intensity,
        mc.reflection_text,
        e.name as emotion_name,
        e.emoji as emotion_emoji
       FROM mood_checkins mc
       JOIN emotions e ON mc.emotion_id = e.id
       WHERE mc.user_id = $1 AND mc.created_date >= $2
       ORDER BY mc.created_at DESC
       LIMIT 50`,
      [userId, monthAgo.toISOString().split('T')[0]]
    )

    // Simple AI insight generation (in production, this would call Gigachat API)
    let aiInsight = "На основе ваших данных: "
    
    if (checkinsResult.rows.length === 0) {
      aiInsight += "пока недостаточно данных для глубокого анализа. Продолжайте отслеживать настроение ежедневно."
    } else {
      const emotionCounts = {}
      let totalIntensity = 0
      
      checkinsResult.rows.forEach(checkin => {
        if (!emotionCounts[checkin.emotion_name]) {
          emotionCounts[checkin.emotion_name] = 0
        }
        emotionCounts[checkin.emotion_name]++
        totalIntensity += checkin.intensity
      })

      const dominantEmotion = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])[0]

      const avgIntensity = (totalIntensity / checkinsResult.rows.length).toFixed(1)

      aiInsight += `преобладает эмоция ${dominantEmotion[0]} (${dominantEmotion[1]} записей). `
      aiInsight += `Средняя интенсивность настроения: ${avgIntensity}/10. `

      if (avgIntensity > 7) {
        aiInsight += "Вы часто испытываете сильные эмоции - это может быть как ресурсом, так и источником стресса."
      } else if (avgIntensity < 4) {
        aiInsight += "Эмоции обычно спокойные - хорошая основа для баланса, но следите за апатией."
      }
    }

    // Save insight to database
    const result = await pool.query(
      `INSERT INTO emotional_insights (user_id, insight)
       VALUES ($1, $2)
       RETURNING id, insight, created_at`,
      [userId, aiInsight]
    )

    res.json({
      ok: true,
      insight: result.rows[0],
      message: 'AI инсайт успешно сгенерирован'
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
