
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const currentModuleURL = import.meta.url;
const currentModulePath = fileURLToPath(currentModuleURL);
const projectDirectory = dirname(currentModulePath);

const slash = process.platform === "win32" ? "\\" : "/";

export default {
    NODE_ENV: process.env.NODE_ENV || "",
    API_VERSION: process.env.API_VERSION || "",
    PORT: 4000,
    APP_KEY: process.env.APP_KEY || "",
    API_VERSION: process.env.API_VERSION || "",
    MONGO_DB_URL: process.env.MONGO_DB_URL || "",
    DB_HOST: process.env.DB_HOST || "",
    DB_NAME: process.env.DB_NAME || "",
    DB_USERNAME: process.env.DB_USERNAME || "",
    DB_PASSWORD: process.env.DB_PASSWORD || "",
    DB_PROVIDER: process.env.DB_PROVIDER || "",
    UPLOAD_DIRECTORY: process.env.UPLOAD_DIRECTORY || `${projectDirectory}${slash}uploads${slash}`,
    MULTER_STORAGE_TYPE: 1,
    CURRENCY: "&euro;",
    WEBSITE_TITLE: "",
    USE_PRISMA: false,
    USE_SEQUELIZE: false,
}

/*
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
DATABASE_URL="mysql://user:password@localhost:3306/mydb"
DATABASE_URL="file:./dev.db"
DATABASE_URL="sqlserver://localhost:1433;database=mydb;user=user;password=pass;encrypt=true"
MONGO_DB_URL="mongodb://aym:8uns%3ocalhost:27017/?authSource=package_track&authMechanism=SCRAM-SHA-1"
*/