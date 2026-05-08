import db from "./database";

const defaultGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 60,
  weight: null,
};

export const getUserGoals = async () => {
  const result = await db.getFirstAsync(
    `SELECT calories, protein, carbs, fat, weight
     FROM user_goals
     ORDER BY id DESC
     LIMIT 1`
  );

  return {
    calories: result?.calories || defaultGoals.calories,
    protein: result?.protein || defaultGoals.protein,
    carbs: result?.carbs || defaultGoals.carbs,
    fat: result?.fat || defaultGoals.fat,
    weight: result?.weight || defaultGoals.weight,
  };
};
