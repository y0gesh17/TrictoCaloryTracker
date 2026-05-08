import db from "./database";

export const initDB = () => {
  return db.execAsync(`
    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      calories_per_100g REAL,
      protein_per_100g REAL,
      carbs_per_100g REAL,
      fat_per_100g REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

  CREATE TABLE IF NOT EXISTS food_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  food_id INTEGER,
  food_name TEXT,
  weight REAL,
  calories REAL,
  protein REAL,
  carbs REAL,
  fat REAL,
  date TEXT,
  meal_type TEXT,
  image_uri TEXT, -- ✅ ADD THIS
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
    CREATE TABLE IF NOT EXISTS daily_summary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      total_calories REAL,
      total_protein REAL,
      total_carbs REAL,
      total_fat REAL
    );

    CREATE TABLE IF NOT EXISTS user_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      calories REAL,
      protein REAL,
      carbs REAL,
      fat REAL,
      weight REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS weight_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  weight REAL,
  date TEXT UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS goal_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  calories REAL,
  protein REAL,
  carbs REAL,
  fat REAL,
  weight REAL,
  date TEXT
);
  `);
  
  
};
