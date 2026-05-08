import db from "./database";

// export const getTodayMeals = async () => {
//   const today = new Date().toISOString().split("T")[0];

//   const result = await db.getAllAsync(`
//     SELECT meal_type, 
//            SUM(calories) as total_calories,
//            MAX(image_uri) as image
//     FROM food_logs
//     WHERE date = ?
//     GROUP BY meal_type
//   `, [today]);

//   return result;
// };
export const getTodayMeals = async (date) => {
  return await db.getAllAsync(
    `
    SELECT meal_type, SUM(calories) as total_calories, MAX(image_uri) as image
    FROM food_logs
    WHERE date = ?
    GROUP BY meal_type
  `,
    [date]
  );
};
