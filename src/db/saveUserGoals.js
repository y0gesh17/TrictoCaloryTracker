import db from "./database";

export const saveUserGoals = async (goals, weight) => {
  await db.runAsync(`DELETE FROM goal_history WHERE date = ?`, [goals.date]);

  await db.runAsync(
    `INSERT INTO goal_history (calories, protein, carbs, fat, date, weight)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      goals.calories,
      goals.protein,
      goals.carbs,
      goals.fat,
      goals.date,
      weight,
    ]
  );
};
