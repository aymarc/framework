
import config from "../config.mjs";
import Utils from "./index.mjs";
import { ErrorMessage } from "./error.mjs"


class DBInit {
    constructor() {
        this._config = config;
        this._utils = new Utils();

    }

    init() {
        const { USE_PRISMA, USE_SEQUELIZE } = this._config;
        if (USE_PRISMA && USE_SEQUELIZE) {
            throw new ErrorMessage("Error initializing database. Cannot setup Prisma and Sequelize. This error occurred because you set both 'USE_PRISMA' and 'USE_SEQUELIZE' to true.");
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
        }
    }
}