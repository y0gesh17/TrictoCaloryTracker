import db from "./database";

// export const getTodaySummary = async () => {
//   const today = new Date().toISOString().split("T")[0];

//   const result = await db.getFirstAsync(
//     `SELECT 
//       SUM(calories) as calories,
//       SUM(protein) as protein,
//       SUM(carbs) as carbs,
//       SUM(fat) as fat
//      FROM food_logs 
//      WHERE date = ?`,
//     [today]
//   );

//   return {
//     calories: result?.calories || 0,
//     protein: result?.protein || 0,
//     carbs: result?.carbs || 0,
//     fat: result?.fat || 0,
//   };
// };
// export const getTodaySummary = async (date) => {
//   const result = await db.getFirstAsync(
//     `SELECT * FROM daily_summary WHERE date = ?`,
//     [date]
//   );

//   return result || {
//     calories: 0,
//     protein: 0,
//     carbs: 0,
//     fat: 0,
//   };
// };


export const getTodaySummary = async (date) => {
  const result = await db.getFirstAsync(
    `
    SELECT 
      SUM(calories) as calories,
      SUM(protein) as protein,
      SUM(carbs) as carbs,
      SUM(fat) as fat
    FROM food_logs
    WHERE date = ?
    `,
    [date]
  );

  return {
    calories: result?.calories || 0,
    protein: result?.protein || 0,
    carbs: result?.carbs || 0,
    fat: result?.fat || 0,
  };
};