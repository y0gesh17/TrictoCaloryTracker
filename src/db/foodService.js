import db from "./database";

export const addFoodLog = async (food) => {
  await db.runAsync(
    `INSERT INTO food_logs 
     (food_name, weight, calories, protein, carbs, fat, date, meal_type, image_uri)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      food.food_name,
      food.weight,
      food.calories,
      food.protein,
      food.carbs,
      food.fat,
      food.date,
      food.meal_type,
      food.image_uri, // ✅ important
    ]
  );
};

export const updateFoodLog = async (id, food) => {
  await db.runAsync(
    `
    UPDATE food_logs
    SET food_name = ?,
        weight = ?,
        calories = ?,
        protein = ?,
        carbs = ?,
        fat = ?,
        meal_type = ?
    WHERE id = ?
    `,
    [
      food.food_name,
      food.weight,
      food.calories,
      food.protein,
      food.carbs,
      food.fat,
      food.meal_type,
      id,
    ]
  );
};

export const deleteFoodLog = async (id) => {
  await db.runAsync(`DELETE FROM food_logs WHERE id = ?`, [id]);
};
