export const getDailySummary = async () => {
  const today = new Date().toISOString().split("T")[0];

  const result = await db.getFirstAsync(
    `SELECT 
      SUM(calories) as calories,
      SUM(protein) as protein,
      SUM(carbs) as carbs,
      SUM(fat) as fat
     FROM food_logs WHERE date = ?`,
    [today]
  );

  return result;
}; 