import Joi from "joi";

class DeliveryValidation {
    constructor() {
        this.Joi = Joi;
    }

    create() {
        return {
            body: {
                schema: Joi.object({
                    package_id: Joi.string().uuid().required(),
                    active_delivery_id: Joi.string().allow(null), // Optional reference
                    description: Joi.string().allow(''), // Optional string
                    weight: Joi.number().required(),
                    width: Joi.number().required(),
                    height: Joi.number().required(),
                    depth: Joi.number().required(),
                    from_name: Joi.string().required(),
                    from_address: Joi.string().required(),
                    from_location: Joi.object({
                        lat: Joi.number().required(),
                        lng: Joi.number().required(),
                    }).required(),
                    to_name: Joi.string().required(),
                    to_address: Joi.string().required(),
                    to_location: Joi.object({
                        lat: Joi.number().required(),
                        lng: Joi.number().required(),
                    }).required(),
                }),
            }
        }
    }
    update() {
        return {
            body: {
                schema: Joi.object({
                    active_delivery_id: Joi.string().allow(null), // Optional reference
                    description: Joi.string().allow(''), // Optional string
                    weight: Joi.number().required(),
                    width: Joi.number().required(),
                    height: Joi.number().required(),
                    depth: Joi.number().required(),
                    from_name: Joi.string().required(),
                    from_address: Joi.string().required(),
                    from_location: Joi.object({
                        lat: Joi.number().required(),
                        lng: Joi.number().required(),
                    }).required(),
                    to_name: Joi.string().required(),
                    to_address: Joi.string().required(),
                    to_location: Joi.object({
                        lat: Joi.number().required(),
                        lng: Joi.number().required(),
                    }).required(),
                }),
            },
            params: {
                schema: Joi.object({
                    package_id: Joi.string().uuid().required(),
                }),
            }
        }
    }

    listOne() {
        return {
            params: {
                schema: Joi.object({
                    package_id: Joi.string().uuid().required(),
                })
            }
        }
    }

    list() {
        return {
            query: {
                schema: Joi.object({
                    active_delivery_id: Joi.string().allow(null), // Optional reference
                    description: Joi.string().allow(''), // Optional string
                    weight: Joi.number(),
                    width: Joi.number(),
                    height: Joi.number(),
                    depth: Joi.number(),
                    from_name: Joi.string(),
                    from_address: Joi.string(),
                    from_location: Joi.object({
                        lat: Joi.number().required(),
                        lng: Joi.number().required(),
                    }),
                    to_name: Joi.string(),
                    to_address: Joi.string(),
                    to_location: Joi.object({
                        lat: Joi.number().required(),
                        lng: Joi.number().required(),
                    }),
                    offset: Joi.number(),
                    limit: Joi.number()
                }),
            },
            body: Joi.object({
                filter: {
                    active_delivery_id: Joi.string().allow(null), // Optional reference
                    description: Joi.string().allow(''), // Optional string
                    weight: Joi.number(),
                    width: Joi.number(),
                    height: Joi.number(),
                    depth: Joi.number(),
                    from_name: Joi.string(),
                    from_address: Joi.string(),
                    from_location: Joi.object({
                        lat: Joi.number().required(),
                        lng: Joi.number().required(),
                    }),
                    to_name: Joi.string(),
                    to_address: Joi.string(),
                    to_location: Joi.object({
                        lat: Joi.number().required(),
                        lng: Joi.number().required(),
                    })
                },
                linkOperator: Joi.string(),
                offset: Joi.number(),
                limit: Joi.number()
            }),
            params: Joi.object({
                package_id: Joi.string().uuid(),
            })
        }
    }

    remove() {
        return {
            params: Joi.object({
                package_id: Joi.string().uuid().required(),
            })

        }
    }

}
export default DeliveryValidation;
