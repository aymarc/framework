
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';

import { Service } from "../../utils/base.mjs"
import { ExistError, ErrorMessage, AuthenticationError } from "../../utils/error.mjs";
import Token from "../token/service.mjs";
import config from "../../config.mjs";
import RedisStore from "../../utils/redisStore.mjs";
import { REDIS_KEY } from "../../utils/constants.mjs";

const prisma = new PrismaClient();

const redisClient = new RedisStore();

export default class UserService extends Service {
    constructor() {
        this.secret_key = config.APP_KEY;
        this.token_validity = config.JWT_TOKEN_VALIDITY || 86400;
        this.salt = 10;
    }

    listUser = async (req) => {
        const data = await this.list(req, UserModel);
        return {
            success: true,
            info: `${GENERIC_GET_REQ_SUCCESS_MESSAGE} ${data.length ? "the list of Users" : "the User"}.`,
            data
        };
    }

    createUser = async (req) => {
        const data = await this.create(req, UserModel);
        return {
            success: true,
            info: `${GENERIC_POST_REQ_SUCCESS_MESSAGE} a User.`,
            data
        };
    }

    updateUser = async (req) => {
        const data = await this.update(req, UserModel);
        return {
            success: true,
            info: `${GENERIC_UPDATE_REQ_SUCCESS_MESSAGE} a User.`,
            data
        };
    }

    removeUser = async (req) => {
        const data = await this.remove(req, UserModel);
        return {
            success: true,
            info: `${GENERIC_DELETE_REQ_SUCCESS_MESSAGE} a User.`,
            data
        };
    }

}