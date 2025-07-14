"use strict";

import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import process from "process";

// Load configuration
const env: string = process.env.NODE_ENV || "development";
const config = require(path.join(
  __dirname,
  "/../database/sequelize.config.js"
))[env];
const basename: string = path.basename(__filename);

// Define database object type
interface DB {
  [key: string]: any;
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
}

// Initialize the database object
const db: DB = {} as DB;

// Initialize Sequelize
let sequelize: Sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(
    process.env[config.use_env_variable] as string,
    config
  );
} else {
  sequelize = new Sequelize(
    config.database!,
    config.username!,
    config.password!,
    config
  );
}

// Read and import model files
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      !file.endsWith(".test.js")
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Associate models if applicable
Object.keys(db).forEach((modelName) => {
  if (db[modelName]?.associate) {
    db[modelName].associate(db);
  }
});

// Attach Sequelize and sequelize instance to db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Export the database object
export default db;
