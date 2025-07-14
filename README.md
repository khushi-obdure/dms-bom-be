# dms_backend

DMS Node JS Backend

# Overview

This project provides tools for efficient development, deployment, linting, and database management using SWC, Sequelize, Jest, and PM2.

# Requirements

    Node.js: v18 or higher
    NPM or Yarn

# Installation

1.  Clone the repository:
    git clone <repository-url>
    cd <project-directory>

2.  Install dependencies:
    npm install

3.  Scripts

    # Runs the server using nodemon with local environment configuration.

        cmd: npm run local

4.  Database Migrations (Sequelize)

    # Creates a new migration with a name specified by the $MIGRATION_NAME variable.

    MIGRATION_NAME=<migration name> npm run migrate:create

    # Runs a single migration by name.

    npm run migrate:up:one <migration name>

    # Reverts a specific migration by name.

    npm run migrate:undo <migration name>

    # Applies all pending migrations.

    npm run migrate:up:all

    # Reverts all applied migrations.

    npm run migrate:undo:all

    # full path to run single migration file

    npx sequelize-cli db:migrate --migrations-path src/migrations --name 20250625083116-add.version.parentBomId.bom

5.  Database Seeders (Sequelize)

    # Creates a new seeder file with a name specified by the $SEEDER_NAME variable.

    SEEDER_NAME=<seeder name> npm run seeder:create

    # Reverts a specific seeder by name.

    npm run seeder:undo <seeder name>

    # Applies all pending seeders.

    npm run seeder:up:all

   # command to up the new role :

    npx sequelize-cli db:seed --seed src/seeders/20250624070240-add-plant-moderator-role.ts 

   # command to undo the new role:

    npm run seeder:undo -- --seed 20250624070240-add-plant-moderator-role.ts


Note: If the super admin data is missing in the user table and the plant data is missing in the in plant table, please run the following command   `npm run seeder:up:all`.

Note: Before running the application, ensure you add the Google Drive credentials at the following path: src/creds/credentials.json.