import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("calorie.db");

export default db;