import db from "./database";

// 📊 Calories grouped by date
// export const getCaloriesByRange = async () => {
//   const result = await db.getAllAsync(`
//     SELECT date, SUM(calories) as calories
//     FROM food_logs
//     GROUP BY date
//     ORDER BY date ASC
//   `);

//   return result;
// };
export const getCaloriesByRange = async (days) => {
  const result = await db.getAllAsync(
    `
    SELECT date, SUM(calories) as calories
    FROM food_logs
    WHERE date >= date('now', ?)
    GROUP BY date
    ORDER BY date ASC
    `,
    [`-${days} days`]
  );

  return result;
};
// ⚖️ Weight tracking
export const getWeightData = async () => {
  const result = await db.getAllAsync(`
    SELECT date, weight
    FROM food_logs
    WHERE weight IS NOT NULL
    ORDER BY date ASC
  `);

  return result;
};

export const getCalendarData = async () => {
  return await db.getAllAsync(`
    SELECT 
      date,
      SUM(calories) as total_calories
    FROM food_logs
    GROUP BY date
  `);
};

export const getMealsByDate = async (date) => {
  return await db.getAllAsync(
    `
    SELECT meal_type, SUM(calories) as total_calories, image_uri
    FROM food_logs
    WHERE date = ?
    GROUP BY meal_type
  `,
    [date]
  );
};

// export const getWeightByDate = async (date) => {
//   return await db.getFirstAsync(
//     `SELECT weight FROM weight_logs WHERE date = ?`,
//     [date]
//   );
// };
export const getCalendarSummary = async (year, month) => {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const end = `${year}-${String(month).padStart(2, "0")}-31`;

  return await db.getAllAsync(
    `
    SELECT date, SUM(calories) as total_calories
    FROM food_logs
    WHERE date BETWEEN ? AND ?
    GROUP BY date
  `,
    [start, end]
  );
};

export const getMealsWithFoods = async (date) => {
  return await db.getAllAsync(
    `
    SELECT * FROM food_logs
    WHERE date = ?
  `,
    [date]
  );
};

export const getWeightByDate = async (date) => {
  return await db.getFirstAsync(
    `SELECT weight FROM weight_logs WHERE date = ?`,
    [date]
  );
};