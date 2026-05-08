import db from "./database";

export const getSummaryByDate = async (date) => {
  try {
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
  } catch (error) {
    console.log("Summary error:", error);
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
  }
};