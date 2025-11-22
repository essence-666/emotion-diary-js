CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    subscription_tier TEXT DEFAULT 'free';
);

CREATE TABLE emotions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE mood_checkins (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    emotion_id INT REFERENCES emotions(id),
    mood_score INT NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE diary_entries (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE diary_entry_tags (
    entry_id INT REFERENCES diary_entries(id),
    tag_id INT REFERENCES tags(id),
    PRIMARY KEY (entry_id, tag_id)
);

CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    name TEXT,
    happiness INT DEFAULT 50,
    last_fed_at TIMESTAMP,
    last_interaction_at TIMESTAMP
);

CREATE TABLE pet_interactions (
    id SERIAL PRIMARY KEY,
    pet_id INT REFERENCES pets(id),
    action TEXT NOT NULL,
    amount INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

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
