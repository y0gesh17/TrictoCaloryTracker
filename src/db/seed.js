import db from "./database";

export const seedDatabase = async () => {
  try {
    // ✅ Check if already seeded
    const result = await db.getFirstAsync(
      "SELECT COUNT(*) as count FROM food_logs"
    );

    if (result.count > 0) {
      console.log("DB already seeded");
      return;
    }

    console.log("Seeding database...");

    const today = new Date().toISOString().split("T")[0];

    // ✅ Dummy Food Logs
    await db.execAsync(`
      INSERT INTO food_logs 
      (food_name, weight, calories, protein, carbs, fat, date, meal_type)
      VALUES 
      ('Boiled Eggs', 100, 155, 13, 1.1, 11, '${today}', 'breakfast'),

      ('Brown Bread', 60, 160, 6, 28, 2, '${today}', 'breakfast'),

      ('Chicken Breast', 150, 250, 31, 0, 5, '${today}', 'lunch'),

      ('Rice', 200, 260, 5, 57, 1, '${today}', 'lunch'),

      ('Paneer', 100, 265, 18, 6, 20, '${today}', 'dinner'),

      ('Milk', 200, 120, 6, 10, 5, '${today}', 'snack')
    `);

    console.log("Seeding completed 🚀");
  } catch (error) {
    console.log("Seeding error:", error);
  }
};