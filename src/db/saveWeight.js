import db from "./database";

export const saveWeight = async (weight, date) => {
  await db.runAsync(
    `
    INSERT INTO weight_logs (weight, date)
    VALUES (?, ?)
    ON CONFLICT(date) DO UPDATE SET weight = excluded.weight
  `,
    [weight, date]
  );
};