import fs from "fs";
import path from "path";
import db from "./db";

const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

db.exec(schema);
console.log("Database schema created ✅");
