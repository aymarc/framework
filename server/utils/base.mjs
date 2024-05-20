import { Router } from "express";
//
import Validator from "./validator.mjs";
import constants from "./constants.mjs";

const _v_ = new Validator();
const { CODE200 } = constants;

export class Controller {

    constructor() {
        this.routes = Router();
    }

    router(path, validationSchema = null, callbackAction = null) {
        this.routes.get(path, _v_.param(validationSchema), async (req, res, next) => {
            try {
                res.status(CODE200).json(await callbackAction(req))
            } catch (err) {
                next(err);
            }
        })
    }
}


export class Service {

    async create(req, model) {
        try {
            await model.create(req.body);
        } catch (err) {
            next(err);
        }
    }

    async list(req, model) {
        try {
            const { filter, skip, limit } = this.formatQueriesMg(req);
            let result = null;
            if (filter) {
                result = await model.find(filter).skip(skip).limit(limit);
            } else {
                result = await model.find().skip(skip).limit(limit);
            }
            return result;
        } catch (err) {
            next(err);
        }
    }

    async update(req, model) {

        try {
            const { filter: condition } = this.formatQueriesMg(req);
            await model.update(
                condition,
                { $set: body },
                { multi: true }
            );
            const result = await this.list(req, model);
            return result;
        } catch (err) {
            next(err);
        }
    }

    async remove(req, model) {

        try {
            const { filter: condition } = this.formatQueriesMg(req);
            await model.deleteMany(condition);
        } catch (err) {
            next(err);
        }
    }

    formatQueriesMg(req) {
        /**
         * Description: Extract filters from request and format it
         * Input: req | type = object, desc = request object from express framework having queries, params, and body
         * Returns: finalFilter | type = object
         */
        try {
            const { query = {}, params = {} } = req;
            const filter = req.body.filter || {
                fields: [],
                offset: 0,
                limit: 10,
                linkOperator: "or"
            };

            let { offset: skip = 0, limit = 10 } = filter;

            const queryFields = Object.keys(query);
            const paramFields = Object.keys(params);
            const filterFields = filter.fields || [];

            const queryAndParamFilters = [];
            const andFilter = [];
            const orFilter = [];

            for (const field of filterFields) {
                const filterValue = field.operator === "=" ? field.value :
                    field.operator === "<=" ? { $lte: field.value } :
                        field.operator === "<" ? { $lt: field.value } :
                            field.operator === ">=" ? { $gte: field.value } :
                                field.operator === ">" ? { $gt: field.value } :
                                    field.operator === "!=" ? { $ne: field.value } :
                                        { $regex: field.value, $options: "i" };

                if (filter.linkOperator.toLowerCase() === "and") {
                    andFilter.push({ [field.name]: filterValue });
                } else {
                    orFilter.push({ [field.name]: filterValue });
                }

                delete query[field.name];
                delete params[field.name];
            }

            for (const field of queryFields) {
                if (field === "offset") {
                    skip = query[field];
                } else if (field === "limit") {
                    limit = query[field];
                } else {
                    queryAndParamFilters.push({ [field]: query[field] });
                }
            }

            for (const field of paramFields) {
                queryAndParamFilters.push({ [field]: params[field] });
            }

            let finalFilter = {};
            if (orFilter.length && queryAndParamFilters.length) {
                finalFilter["$and"] = [{ $and: queryAndParamFilters }, { $or: orFilter }];
            } else if (andFilter.length && queryAndParamFilters.length) {
                finalFilter["$and"] = [...andFilter, ...queryAndParamFilters];
            } else if (andFilter.length) {
                finalFilter["$and"] = andFilter;
            } else if (orFilter.length) {
                finalFilter["$or"] = orFilter;
            } else if (queryAndParamFilters.length) {
                finalFilter["$and"] = queryAndParamFilters;
            }

            return { filter: finalFilter, skip, limit };
        } catch (err) {
            throw new Error(err);
        }
    }


}