import db from "./database";

export const getWeightByDate = async (date) => {
  const result = await db.getFirstAsync(
    `SELECT weight FROM weight_logs WHERE date = ?`,
    [date]
  );

  return result?.weight || "";
};