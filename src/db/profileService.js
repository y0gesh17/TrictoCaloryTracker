import db from "./database";
import { toDateKey } from "../utils/date";

// 🔥 Update calorie goal
// export const updateCalorieGoal = async (calories) => {
//   await db.runAsync(
//     `UPDATE user_goals SET calories = ? WHERE id = 1`,
//     [calories]
//   );
// };
export const updateCalorieGoal = async (goal) => {
  const today = toDateKey();

  await db.runAsync(`DELETE FROM goal_history WHERE date = ?`, [today]);

  await db.runAsync(
    `
    INSERT INTO goal_history (calories, protein, carbs, fat, date)
    VALUES (?, ?, ?, ?, ?)
    `,
    [goal.calories, goal.protein, goal.carbs, goal.fat, today]
  );

  console.log("Updated goal for date:", today, goal);
};
// 🔥 Reset today's data
export const resetTodayData = async (date) => {
  await db.runAsync(`DELETE FROM food_logs WHERE date = ?`, [date]);
  await db.runAsync(`DELETE FROM weight_logs WHERE date = ?`, [date]);
};

// 🔥 Reset ALL data
export const resetAllData = async () => {
  await db.execAsync(`
    DELETE FROM food_logs;
    DELETE FROM weight_logs;
    DELETE FROM daily_summary;
  `);
};
