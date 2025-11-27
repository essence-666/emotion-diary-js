CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    subscription_tier TEXT DEFAULT 'free',
    subscription_expires_at TIMESTAMP
);

CREATE TABLE emotions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT,
    color_hex TEXT
);

CREATE TABLE mood_checkins (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    emotion_id INT REFERENCES emotions(id),
    intensity INT NOT NULL,                
    reflection_text TEXT,                  
    created_at TIMESTAMP DEFAULT NOW(),    
    created_date DATE DEFAULT CURRENT_DATE 
);

CREATE TABLE diary_entries (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    title TEXT,
    content TEXT NOT NULL,

    source_checkin_ids TEXT[] DEFAULT '{}',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    entry_date DATE DEFAULT CURRENT_DATE,

    is_private BOOLEAN DEFAULT FALSE,
    ai_summary TEXT
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    emoji TEXT
);

CREATE TABLE diary_entry_tags (
    entry_id INT REFERENCES diary_entries(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id),
    PRIMARY KEY (entry_id, tag_id)
);


CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL DEFAULT 'Мой питомец',
    pet_type VARCHAR(50) NOT NULL DEFAULT 'mood_cat',
    happiness_level INT NOT NULL DEFAULT 50,
    cosmetic_skin VARCHAR(100),
    last_fed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индекс по пользователю для быстрого поиска
CREATE UNIQUE INDEX idx_pets_user_id ON pets(user_id);

CREATE TABLE pet_interactions (
    id SERIAL PRIMARY KEY,
    pet_id INT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'fed', 'petted', 'talked_to'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска взаимодействий по питомцу
CREATE INDEX idx_pet_interactions_pet_id ON pet_interactions(pet_id);

CREATE TABLE user_streaks (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_checkin TIMESTAMP
);

CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),

    tier TEXT NOT NULL,
    stripe_subscription_id TEXT,
    payment_method TEXT DEFAULT 'stripe',

    start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE emotional_insights (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- weekly_summary | mood_trigger | recommendation
    insight_type TEXT NOT NULL,

    -- Сам текст инсайта или рекомендации
    content TEXT NOT NULL,

    -- начало периода (неделя, месяц и т.д.)
    period_start_date DATE NOT NULL,

    generated_at TIMESTAMP DEFAULT NOW()
);

-- Индекс по пользователю и типу
CREATE INDEX idx_emotional_insights_user_type
    ON emotional_insights(user_id, insight_type);

-- Индекс по дате периода
CREATE INDEX idx_emotional_insights_period
    ON emotional_insights(period_start_date);

CREATE TABLE reflection_prompts (
    id SERIAL PRIMARY KEY,

    -- Текст промпта
    prompt_text TEXT NOT NULL,

    -- Категория: "self-reflection", "productivity", "gratitude", etc.
    category TEXT DEFAULT 'general',

    -- Доступно только Premium
    is_premium BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO reflection_prompts (prompt_text, category, is_premium) VALUES
('Сегодня напишите три вещи, за которые вы благодарны.', 'gratitude', false),
('Что сделало вас счастливым сегодня?', 'self-reflection', false),
('Опишите один случай, когда вы почувствовали гордость за себя.', 'self-reflection', false),
('Какие ваши цели на завтра и как вы к ним приблизитесь?', 'productivity', false),
('Напишите одно положительное событие, которое произошло за неделю.', 'gratitude', false),
('Какое ваше любимое воспоминание о прошедшем месяце?', 'self-reflection', false),
('Что вы можете сделать сегодня, чтобы улучшить настроение?', 'self-reflection', false),
('Составьте короткий список того, что помогает вам расслабиться.', 'stress_management', false);

CREATE TABLE reflection_responses (
    id SERIAL PRIMARY KEY,

    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    prompt_id INT REFERENCES reflection_prompts(id) ON DELETE CASCADE,

    response_text TEXT NOT NULL,

    -- Дата, к которой относится ответ (для "одного ответа в день")
    response_date DATE DEFAULT CURRENT_DATE,

    -- Для связи с дневником (по желанию)
    associated_diary_entry_id INT REFERENCES diary_entries(id),

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    theme TEXT DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT true
);

INSERT INTO emotions (name, emoji, color_hex) VALUES
('Happy', '😊', '#FFD93D'),
('Sad', '😢', '#6C9BCF'),
('Angry', '😡', '#E63946'),
('Calm', '😌', '#90BE6D'),
('Anxious', '😰', '#577590'),
('Excited', '🤩', '#FF6B6B');

INSERT INTO tags (name, category, emoji) VALUES
('Work', 'productivity', '💼'),
('Study', 'productivity', '📚'),
('Health', 'wellbeing', '💊'),
('Mood', 'emotions', '😊'),
('Stress', 'emotions', '😰'),
('Sleep', 'health', '😴');

-- Добавить updated_at в таблицу users
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- Создать индексы для улучшения производительности
CREATE INDEX idx_mood_checkins_user_id ON mood_checkins(user_id);
CREATE INDEX idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_emotional_insights_user_id ON emotional_insights(user_id);
CREATE INDEX idx_reflection_responses_user_id ON reflection_responses(user_id);

-- Добавить индексы для улучшения производительности
CREATE INDEX idx_reflection_responses_user_id ON reflection_responses(user_id);
CREATE INDEX idx_reflection_responses_created_at ON reflection_responses(created_at DESC);
CREATE INDEX idx_reflection_responses_prompt_id ON reflection_responses(prompt_id);
CREATE INDEX idx_reflection_prompts_category ON reflection_prompts(category);

-- Добавить колонку для метаданных промптов (опционально)
ALTER TABLE reflection_prompts ADD COLUMN difficulty_level VARCHAR(20) DEFAULT 'medium';
ALTER TABLE reflection_prompts ADD COLUMN estimated_time_minutes INTEGER DEFAULT 5;
ALTER TABLE reflection_prompts ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Добавить несколько демо-промптов если их нет
INSERT INTO reflection_prompts (prompt, category) VALUES
('Что сегодня вызвало у вас самые сильные эмоции и почему?', 'emotions'),
('Опишите момент сегодняшнего дня, за который вы чувствуете благодарность', 'gratitude'),
('Какое небольшое достижение сегодня сделало ваш день лучше?', 'achievements'),
('Что вы узнали о себе сегодня?', 'self_discovery'),
('Как вы позаботились о своем ментальном здоровье сегодня?', 'self_care'),
('Опишите вызов, с которым вы столкнулись сегодня, и как вы с ним справились', 'challenges'),
('Какая мысль или идея сегодня вас больше всего вдохновила?', 'inspiration'),
('Что бы вы хотели сделать по-другому завтра?', 'reflection'),
('Как вы поддерживали или получали поддержку от других сегодня?', 'relationships'),
('Что сегодня помогло вам чувствовать себя в гармонии с собой?', 'balance');

-- Создать таблицу для избранных промптов пользователя (опционально)
CREATE TABLE user_favorite_prompts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    prompt_id INTEGER REFERENCES reflection_prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, prompt_id)
);
