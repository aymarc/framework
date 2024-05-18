import { json, raw, urlencoded } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
//
import constants from "./constants.mjs";

const { CODE404, CODE500 } = constants;

class Middleware {

    constructor(app, env) {
        this.app = app;
        this.env = env;
        if (this.env.NODE_ENV === "prod") {
            this.app.use(helmet());
            this.app.use(compression());
        }
        this.app.use(raw());
        this.app.use(json());
        this.app.use(urlencoded({ extended: true }));
        this.app.use(cors());
    }

    catchErrors() {
        this.app.use((err, req, res, next) => {
            if (!err) {
                return next();
            }
            console.error(`================Error Start============= \n ${err} \n =================Error End===============`);
            const message = err.httpStatusCode ? {
                success: false,
                info: err.message
            } : {
                success: false,
                info: "Sorry something went wrong"
            }
            res.status(err.httpStatusCode || CODE500).json(message);
        })
    }

    catchNotFoundRoute() {
        try {
            this.app.use((req, res, next) => {
                res.status(CODE404).json({
                    message: `The route '${req.get("HOST")}${req.originalUrl}' was not found.`
                })
            })
        } catch (err) {
            next(err);
        }
    }
}

export default Middleware;