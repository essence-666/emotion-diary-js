CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    subscription_tier TEXT DEFAULT 'free'
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
    user_id INT REFERENCES users(id),
    stripe_subscription_id TEXT,
    tier TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE emotional_insights (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    insight TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reflection_prompts (
    id SERIAL PRIMARY KEY,
    prompt TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reflection_responses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    prompt_id INT REFERENCES reflection_prompts(id),
    response TEXT NOT NULL,
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