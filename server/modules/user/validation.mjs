import Joi from "joi";

export default class UserValidation {

    constructor() {
        this.Joi = Joi
    }

    list() {
        return this.Joi.object({

            id: this.Joi.number().optional(),

            name: this.Joi.string().optional(),

            email: this.Joi.string().optional(),

        })
    }

    create() {
        return this.Joi.object({

            name: this.Joi.string().required(),

            email: this.Joi.string().email().required(),

            password: this.Joi.string().required(),

            fingerprint: this.Joi.string().optional()
        })
    }

    update() {
        return this.Joi.object({

            id: this.Joi.number().optional(),

            name: this.Joi.string().optional(),

            email: this.Joi.string().email().optional(),

            password: this.Joi.string().optional(),

            roleId: this.Joi.number().optional()

        })
    }


    login() {
        return this.Joi.object({

            email: this.Joi.string().email().required(),

            password: this.Joi.string().required()

        })
    }
}