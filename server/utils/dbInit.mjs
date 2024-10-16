import Sequelize from "sequelize";
import config from "../config.mjs";
import Utils from "./index.mjs";
import { ErrorMessage } from "./error.mjs"
import constants from "./constants.mjs";
import mongoose from 'mongoose';


export default class DBInit {
    constructor() {
        this._config = config;
        this._utils = new Utils();
        this._constants = constants;
    }

    async init() {
        const { USE_PRISMA, USE_SEQUELIZE, USE_MONGO, MONGO_DB_URL } = this._config;
        if ((USE_PRISMA && USE_SEQUELIZE) || (USE_PRISMA && USE_MONGO) || (USE_SEQUELIZE && USE_MONGO)) {
            throw new ErrorMessage("Error initializing database. Cannot setup  multiple db. This error occurred because you set more than one of these 'USE_MONGO', 'USE_PRISMA', 'USE_SEQUELIZE' to true.");
        } else if (USE_PRISMA) {
            const startDirectory = '../'; // Directory to start the search from
            const folderNameToSearch = "prisma"; // The folder to find
            const fileNameToSearch = "schema.prisma"; // The file to find within the folder
            const ignoreFolders = ["node_modules"];
            const { folder = "", file = false } = this._utils.searchFolderAndFile(startDirectory, folderNameToSearch, ignoreFolders, fileNameToSearch);

            if (file) {
                return;
            } else if (!file && folder) {
                this._utils.deleteFolderRecursive(folder);
                this._utils.exeCmd(`
                    npm install @prisma/client
                    npm install prisma --save-dev
                    npx prisma init
                `);
            } else if (!file && !folder) {
                this._utils.exeCmd(`
                    npm install @prisma/client
                    npm install prisma --save-dev
                    npx prisma init
                `);
            }
        } else if (USE_SEQUELIZE) {
            const { DB_PROVIDER, DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD } = this._config;
            let db = null;
            if (DB_PROVIDER === this._constants.DB_PROVIDER.SQLITE) {
                db = new Sequelize({
                    dialect: DB_PROVIDER,
                    storage: DB_NAME //'path/to/database.sqlite'
                });
            } else {
                db = new Sequelize(
                    DB_NAME,
                    DB_USERNAME,
                    DB_PASSWORD,
                    {
                        host: DB_HOST,
                        port: DB_PORT,
                        dialect: DB_PROVIDER,
                    }
                );
            }
            await db.sync();
        } else if (USE_MONGO) {
            this.mongoose = mongoose;
            this.mongoose.connect(MONGO_DB_URL);

            this.mongoose.connection
                .once('open', () => {
                    console.log('=====Mongo DB started=====');
                })
                .on('error', err => {
                    throw new Error(`Error Connecting to mongo db: ${err}`);
                });

        }
    }
}