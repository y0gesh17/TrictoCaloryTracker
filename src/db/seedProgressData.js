import db from "./database";

export const seedProgressData = async () => {
  try {
    // Clear old data (optional)
    await db.execAsync(`DELETE FROM food_logs`);

    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);

      const formattedDate = date.toISOString().split("T")[0];

      await db.runAsync(
        `INSERT INTO food_logs 
        (food_name, calories, protein, carbs, fat, weight, date, meal_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "Dummy Food",
          Math.floor(1500 + Math.random() * 1000), // calories
          Math.floor(50 + Math.random() * 50),
          Math.floor(100 + Math.random() * 100),
          Math.floor(20 + Math.random() * 30),
          Math.floor(60 + Math.random() * 20), // weight
          formattedDate,
          "test",
        ]
      );
    }

    console.log("✅ Dummy data inserted");
  } catch (err) {
    console.log(err);
  }
};