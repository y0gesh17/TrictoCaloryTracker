export const getTodayLogs = async () => {
  const today = new Date().toISOString().split("T")[0];

  const result = await db.getAllAsync(
    `SELECT * FROM food_logs WHERE date = ?`,
    [today]
  );

  return result;
};