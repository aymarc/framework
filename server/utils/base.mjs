import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize'; // Sequelize operators
import { PrismaClient } from '@prisma/client';
//
import Validator from "./validator.mjs";
import constants from "./constants.mjs";
import { ValidationError, AuthenticationError, ErrorMessage } from "./error.mjs";
import RedisStore from "./redisStore.mjs";
import config from "../config.mjs";
import sequelizeModel from "./sequelizeModel.mjs";
import mongoModel from "./mongoModel.mjs";

const _v_ = new Validator();
const redisClient = new RedisStore();
const prisma = new PrismaClient();
const { CODE200, CODE201, CODE204, REDIS_KEY } = constants;

export class Controller {
    routes = null;
    constructor() {
        this.routes = Router();
    }

    route(urlPath, action, validationSchema = null, callbackAction = null) {
        switch (action) {
            case "GET":
                this.#getResource(urlPath, validationSchema, callbackAction);
                break;
            case "POST":
                this.#postResource(urlPath, validationSchema, callbackAction);
                break;
            case "PUT":
                this.#putResource(urlPath, validationSchema, callbackAction);
                break;
            case "DELETE":
                this.#deleteResource(urlPath, validationSchema, callbackAction);
                break;
            default:
                throw new ValidationError("Unsupported http verb");
        }

    }

    #getResource(urlPath, validationSchema, callbackAction) {
        // console.log("validationSchema ", validationSchema)
        this.routes.get(urlPath, _v_.validate(validationSchema), async (req, res, next) => {
            try {
                res.status(CODE200).json(await callbackAction(req, res))
            } catch (err) {
                next(err);
            }
        })
    }

    #postResource(urlPath, validationSchema, callbackAction) {
        this.routes.post(urlPath, _v_.validate(validationSchema), async (req, res, next) => {
            try {
                res.status(CODE201).json(await callbackAction(req, res))
            } catch (err) {
                next(err);
            }
        })
    }

    #putResource(urlPath, validationSchema, callbackAction) {
        this.routes.put(urlPath, _v_.validate(validationSchema), async (req, res, next) => {
            try {
                res.status(CODE201).json(await callbackAction(req, res))
            } catch (err) {
                next(err);
            }
        })
    }

    #deleteResource(urlPath, validationSchema, callbackAction) {
        this.routes.delete(urlPath, _v_.validate(validationSchema), async (req, res, next) => {
            try {
                res.status(CODE204).json(await callbackAction(req, res))
            } catch (err) {
                next(err);
            }
        })
    }


}




export class Service {
    constructor() {
        this._config = config; // Assumes you have a config object to determine the database being used
    }

    // Get the appropriate model based on modelName and the DB in use
    getModel(modelName) {
        if (this._config.USE_PRISMA) {
            return prisma[modelName]; // Return Prisma model
        } else if (this._config.USE_SEQUELIZE) {
            return sequelizeModel[modelName]; // Return Sequelize model
        } else {
            return mongoModel[modelName]; // Return Mongo model
        }
    }

    // Create method that supports all 3 databases (Mongo, Prisma, Sequelize)
    async create(req, modelName) {
        const model = this.getModel(modelName); // Get model based on the modelName

        try {
            if (this._config.USE_PRISMA) {
                await model.create({
                    data: req.body
                });
            } else if (this._config.USE_SEQUELIZE) {
                await model.create(req.body);
            } else {
                await model.create(req.body); // MongoDB
            }
        } catch (err) {
            throw new Error(`Error creating resource in ${req.originalUrl}: ${err}`);
        }
    }

    // List method that supports all 3 databases (Mongo, Prisma, Sequelize)
    async list(req, modelName) {
        const model = this.getModel(modelName); // Get model based on the modelName

        try {
            const { filter, skip, limit } = this.getFilterAndPagination(req);

            if (this._config.USE_PRISMA) {
                return await model.findMany({
                    where: filter,
                    skip: skip,
                    take: limit
                });
            } else if (this._config.USE_SEQUELIZE) {
                return await model.findAll({
                    where: filter,
                    offset: skip,
                    limit: limit
                });
            } else {
                return await model.find(filter).skip(skip).limit(limit); // MongoDB
            }
        } catch (err) {
            throw new Error(`Error listing resource in ${req.originalUrl}: ${err}`);
        }
    }

    // Update method that supports all 3 databases (Mongo, Prisma, Sequelize)
    async update(req, modelName) {
        const model = this.getModel(modelName); // Get model based on the modelName

        try {
            const { filter: condition } = this.getFilterAndPagination(req);

            if (this._config.USE_PRISMA) {
                await model.update({
                    where: condition,
                    data: req.body
                });
            } else if (this._config.USE_SEQUELIZE) {
                await model.update(req.body, {
                    where: condition
                });
            } else {
                await model.updateMany(condition, { $set: req.body }, { multi: true });
            }

            // Return updated list
            return await this.list(req, modelName);
        } catch (err) {
            throw new Error(`Error updating resource in ${req.originalUrl}: ${err}`);
        }
    }

    // Remove method that supports all 3 databases (Mongo, Prisma, Sequelize)
    async remove(req, modelName) {
        const model = this.getModel(modelName); // Get model based on the modelName

        try {
            const { filter: condition } = this.getFilterAndPagination(req);

            if (this._config.USE_PRISMA) {
                await model.deleteMany({
                    where: condition
                });
            } else if (this._config.USE_SEQUELIZE) {
                await model.destroy({
                    where: condition
                });
            } else {
                await model.deleteMany(condition); // MongoDB
            }
        } catch (err) {
            throw new Error(`Error removing resource in ${req.originalUrl}: ${err}`);
        }
    }

    // Login method that supports both Sequelize and Prisma models
    async login(req, userModelName) {
        const userModel = this.getModel(userModelName); // Get user model based on the modelName

        try {
            const { email, username, phone, password } = req.body;

            // Check if the user exists by email, username, or phone
            let user = null;
            if (email) {
                user = await userModel.findOne({ where: { email } });
            }
            if (!user && username) {
                user = await userModel.findOne({ where: { username } });
            }
            if (!user && phone) {
                user = await userModel.findOne({ where: { phone } });
            }

            if (!user) {
                throw new Error("User not found.");
            }

            // Compare hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid credentials.");
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email, username: user.username, phone: user.phone },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            await redisClient.setInRedis(REDIS_KEY.AUTH_TOKEN, token);
            return { message: "Login successful", token };
        } catch (err) {
            throw new Error(`Error logging in: ${err.message}`);
        }
    }

    // Main filter and pagination function that delegates to database-specific functions
    getFilterAndPagination(req, modelName) {
        if (this._config.USE_PRISMA) {
            return this.getFilterAndPaginationPrisma(req);
        } else if (this._config.USE_SEQUELIZE) {
            return this.getFilterAndPaginationSequelize(req);
        } else {
            return this.getFilterAndPaginationMongo(req);
        }
    }

    // MongoDB-specific filter and pagination logic
    getFilterAndPaginationMongo(req) {
        const { query = {}, params = {} } = req;
        const filter = req.body.filter || {
            fields: [],
            offset: 0,
            limit: 10,
            linkOperator: "or"
        };

        let { offset: skip = 0, limit = 10 } = filter;
        const { fields = [], linkOperator = "or" } = filter;

        let whereConditions = [];

        // MongoDB filter conditions
        fields.forEach(field => {
            const { name, value, operator } = field;
            let condition = {};

            switch (operator) {
                case "=":
                    condition = { [name]: value };
                    break;
                case "<=":
                    condition = { [name]: { $lte: value } };
                    break;
                case "<":
                    condition = { [name]: { $lt: value } };
                    break;
                case ">=":
                    condition = { [name]: { $gte: value } };
                    break;
                case ">":
                    condition = { [name]: { $gt: value } };
                    break;
                case "!=":
                    condition = { [name]: { $ne: value } };
                    break;
                case "like":
                    condition = { [name]: { $regex: new RegExp(value, 'i') } }; // MongoDB regex query
                    break;
                case "in":
                    condition = { [name]: { $in: value } };
                    break;
                default:
                    throw new Error(`Unsupported operator for MongoDB: ${operator}`);
            }

            whereConditions.push(condition);
        });

        // Combine conditions with the link operator
        const finalFilter = linkOperator.toLowerCase() === "and" ?
            { $and: whereConditions } : { $or: whereConditions };

        return { filter: finalFilter, skip, limit };
    }

    // Prisma-specific filter and pagination logic
    getFilterAndPaginationPrisma(req) {
        const { query = {}, params = {} } = req;
        const filter = req.body.filter || {
            fields: [],
            offset: 0,
            limit: 10,
            linkOperator: "or"
        };

        let { skip = 0, take = 10 } = filter;
        const { fields = [], linkOperator = "or" } = filter;

        let whereConditions = {};

        // Prisma filter conditions
        fields.forEach(field => {
            const { name, value, operator } = field;

            switch (operator) {
                case "=":
                    whereConditions[name] = value;
                    break;
                case "<=":
                    whereConditions[name] = { lte: value };
                    break;
                case "<":
                    whereConditions[name] = { lt: value };
                    break;
                case ">=":
                    whereConditions[name] = { gte: value };
                    break;
                case ">":
                    whereConditions[name] = { gt: value };
                    break;
                case "!=":
                    whereConditions[name] = { not: value };
                    break;
                case "like":
                    whereConditions[name] = { contains: value, mode: 'insensitive' };
                    break;
                case "in":
                    whereConditions[name] = { in: value };
                    break;
                default:
                    throw new Error(`Unsupported operator for Prisma: ${operator}`);
            }
        });

        // Combine conditions with the link operator
        const finalWhere = linkOperator.toLowerCase() === "and" ?
            { AND: [whereConditions] } : { OR: [whereConditions] };

        return { where: finalWhere, skip, take };
    }

    // Sequelize-specific filter and pagination logic
    getFilterAndPaginationSequelize(req) {
        const { query = {}, params = {} } = req;
        const filter = req.body.filter || {
            fields: [],
            offset: 0,
            limit: 10,
            linkOperator: "or"
        };

        let { offset: skip = 0, limit = 10 } = filter;
        const { fields = [], linkOperator = "or" } = filter;

        let whereConditions = [];

        // Sequelize filter conditions
        fields.forEach(field => {
            const { name, value, operator } = field;
            let condition = {};

            switch (operator) {
                case "=":
                    condition = { [name]: value };
                    break;
                case "<=":
                    condition = { [name]: { [Op.lte]: value } };
                    break;
                case "<":
                    condition = { [name]: { [Op.lt]: value } };
                    break;
                case ">=":
                    condition = { [name]: { [Op.gte]: value } };
                    break;
                case ">":
                    condition = { [name]: { [Op.gt]: value } };
                    break;
                case "!=":
                    condition = { [name]: { [Op.ne]: value } };
                    break;
                case "like":
                    condition = { [name]: { [Op.like]: `%${value}%` } };
                    break;
                case "ilike":
                    condition = { [name]: { [Op.iLike]: `%${value}%` } };
                    break;
                case "in":
                    condition = { [name]: { [Op.in]: value } };
                    break;
                default:
                    throw new Error(`Unsupported operator for Sequelize: ${operator}`);
            }

            whereConditions.push(condition);
        });

        // Combine conditions with the link operator
        const finalWhere = linkOperator.toLowerCase() === "and" ?
            { [Op.and]: whereConditions } : { [Op.or]: whereConditions };

        return { where: finalWhere, offset: skip, limit: limit };
    }

    // Execute Raw Query function, dynamically calls the correct query execution function based on DB configuration
    async executeRaw(queryString, replacements = []) {
        try {
            const { USE_PRISMA, USE_SEQUELIZE } = this._config;

            if (USE_PRISMA) {
                return await this.executeRawQueryPrisma(queryString, replacements);
            } else if (USE_SEQUELIZE) {
                return await this.executeRawQuerySequelize(queryString, replacements);
            } else {
                throw new Error('No database configuration found (Prisma or Sequelize).');
            }
        } catch (err) {
            throw new Error(`Error executing raw query: ${err.message}`);
        }
    }

    // Execute Raw Query for Prisma
    async executeRawQueryPrisma(queryString, params = []) {
        try {
            const result = await prisma.$queryRaw(queryString, ...params);
            return result;
        } catch (err) {
            throw new Error(`Error executing raw query in Prisma: ${err.message}`);
        }
    }

    // Execute Raw Query for Sequelize
    async executeRawQuerySequelize(queryString, replacements = []) {
        try {
            const result = await sequelize.query(queryString, { replacements, type: sequelize.QueryTypes.SELECT });
            return result;
        } catch (err) {
            throw new Error(`Error executing raw query in Sequelize: ${err.message}`);
        }
    }
}
