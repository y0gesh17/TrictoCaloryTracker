import db from "./database";

const defaultGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 60,
};

export const getGoalForDate = async (date) => {
    try{
        const exactGoal = await db.getFirstAsync(
    `
    SELECT calories, protein, carbs, fat
    FROM goal_history
    WHERE date = ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [date]
  );

  if (exactGoal) {
    return {
      calories: Number(exactGoal.calories || defaultGoals.calories),
      protein: Number(exactGoal.protein || defaultGoals.protein),
      carbs: Number(exactGoal.carbs || defaultGoals.carbs),
      fat: Number(exactGoal.fat || defaultGoals.fat),
    };
  }

        let result = await db.getFirstAsync(
    `
    SELECT calories, protein, carbs, fat
    FROM goal_history
    WHERE date <= ?
    ORDER BY date DESC, id DESC
    LIMIT 1
    `,
    [date]

    
  );

  if (!result) {
    result = await db.getFirstAsync(
      `
      SELECT calories, protein, carbs, fat
      FROM goal_history
      ORDER BY date DESC, id DESC
      LIMIT 1
      `
    );
  }

  const resolvedGoal = {
    calories: Number(result?.calories || defaultGoals.calories),
    protein: Number(result?.protein || defaultGoals.protein),
    carbs: Number(result?.carbs || defaultGoals.carbs),
    fat: Number(result?.fat || defaultGoals.fat),
  };

  await db.runAsync(`DELETE FROM goal_history WHERE date = ?`, [date]);
  await db.runAsync(
    `
    INSERT INTO goal_history (calories, protein, carbs, fat, date)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      resolvedGoal.calories,
      resolvedGoal.protein,
      resolvedGoal.carbs,
      resolvedGoal.fat,
      date,
    ]
  );

  console.log("Created goal for date:", date, resolvedGoal);
  return resolvedGoal;
    }
    catch(e){
        console.log("❌ Error fetching goal for date:", e);
        return defaultGoals;
   }
  

};
