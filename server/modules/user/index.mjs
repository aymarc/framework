import { Router } from "express";
import Validation from "./validation.mjs";
import Service from "./service.mjs";
import Utils from "../../utils/index.mjs";

const userValidation = new Validation();
const userService = new Service();
const utils = new Utils();


const router = Router();

export default class User {

    constructor() {
        super();
    }

    init() {
        this.route('/user', 'GET', userValidation.list(), userService.listPackage);
        this.route('/user/:_id', 'GET', userValidation.list(), userService.listPackage);
        this.route('/user', 'POST', userValidation.create(), userService.createPackage);
        this.route('/user/login', 'POST', userValidation.create(), userService.login);
        this.route('/user/:_id', 'PUT', userValidation.update(), userService.updatePackage);
        this.route('/user/:_id', 'DELETE', userValidation.remove(), userService.removePackage);
        return this.routes;
    }

    initRoutes() {



        this.routes.post("/user/logout",
            utils.auth,
            async (req, res, next) => {
                try {
                    res.status(200).json(await service.logout(req.headers));
                } catch (error) {
                    next(error);
                }
            });


        return this.routes;
    }


}