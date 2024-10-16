import { describe, it, expect, vi } from 'vitest';
import DBInit from '../utils/dbInit.mjs'; // Import the class under test
import Utils from '../utils/index.mjs';
import config from '../config.mjs';
import { ErrorMessage } from '../utils/error.mjs';
import constants from '../utils/constants.mjs';

// Mock the dependencies

// Correct mock for config.mjs
vi.mock('../config.mjs', () => ({
    default: {
        USE_PRISMA: false,
        USE_SEQUELIZE: true,
        DB_PROVIDER: 'mysql',
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_NAME: 'test_db',
        DB_USERNAME: 'root',
        DB_PASSWORD: 'password',
    }
}));

vi.mock('../utils/index.mjs', () => ({
    searchFolderAndFile: vi.fn(() => ({ folder: '', file: false })), // Mock search result
    deleteFolderRecursive: vi.fn(),
    exeCmd: vi.fn(),
}));

vi.mock('../utils/constants.mjs', () => ({
    DB_PROVIDER: { SQLITE: 'sqlite', MYSQL: 'mysql' },
}));

vi.mock('../utils/error.mjs', () => ({
    ErrorMessage: class extends Error {
        constructor(message) {
            super(message);
            this.name = 'ErrorMessage';
        }
    },
}));

// Mock Sequelize constructor
vi.mock('sequelize', () => ({
    Sequelize: vi.fn().mockImplementation(() => ({
        sync: vi.fn().mockResolvedValue(true), // Mock Sequelize sync method
    })),
}));

describe('DBInit', () => {
    it('should initialize Sequelize correctly when USE_SEQUELIZE is true', async () => {
        const dbInit = new DBInit();

        await dbInit.init();

        // Check if Sequelize was initialized with correct parameters
        expect(vi.mocked(Sequelize).mock.calls[0][0]).toBe('test_db');
        expect(vi.mocked(Sequelize).mock.calls[0][1]).toBe('root');
        expect(vi.mocked(Sequelize).mock.calls[0][2]).toBe('password');
        expect(vi.mocked(Sequelize).mock.calls[0][3].host).toBe('localhost');
        expect(vi.mocked(Sequelize).mock.calls[0][3].port).toBe(3306);
        expect(vi.mocked(Sequelize).mock.calls[0][3].dialect).toBe('mysql');
    });

    it('should throw an error if both USE_PRISMA and USE_SEQUELIZE are true', async () => {
        // Mock config to use both Prisma and Sequelize
        vi.mocked(config.default).USE_PRISMA = true;
        vi.mocked(config.default).USE_SEQUELIZE = true;

        const dbInit = new DBInit();

        await expect(dbInit.init()).rejects.toThrowError(
            new ErrorMessage("Error initializing database. Cannot setup Prisma and Sequelize. This error occurred because you set both 'USE_PRISMA' and 'USE_SEQUELIZE' to true.")
        );
    });

    it('should install and initialize Prisma if USE_PRISMA is true and schema.prisma is not found', async () => {
        // Set USE_PRISMA to true and mock search result to simulate missing schema.prisma file
        vi.mocked(config.default).USE_PRISMA = true;
        vi.mocked(config.default).USE_SEQUELIZE = false;
        vi.mocked(Utils.prototype.searchFolderAndFile).mockReturnValue({ folder: '', file: false });

        const dbInit = new DBInit();

        await dbInit.init();

        // Check if the correct installation command was executed
        expect(vi.mocked(Utils.prototype.exeCmd).mock.calls[0][0]).toContain('npm install @prisma/client');
        expect(vi.mocked(Utils.prototype.exeCmd).mock.calls[0][0]).toContain('npx prisma init');
    });

    it('should skip Prisma installation if schema.prisma is found', async () => {
        // Set USE_PRISMA to true and mock search result to simulate schema.prisma file found
        vi.mocked(config.default).USE_PRISMA = true;
        vi.mocked(config.default).USE_SEQUELIZE = false;
        vi.mocked(Utils.prototype.searchFolderAndFile).mockReturnValue({ folder: '', file: true });

        const dbInit = new DBInit();

        await dbInit.init();

        // Ensure the install command isn't called
        expect(vi.mocked(Utils.prototype.exeCmd).not.toHaveBeenCalled());
    });
});
