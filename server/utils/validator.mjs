class Validator {
    validate(schemaName) {
        if (!schemaName) {
            throw new Error("No schema supplied to validator");
        }

        return async (req, res, next) => {
            try {
                const validationTypes = Object.keys(schemaName)
                for (let i = 0; i < validationTypes.length; i++) {
                    let schema = schemaName[validationTypes[i]], content = req[validationTypes[i]];
                    const { error } = schema.validate(content);
                    if (error) {
                        throw new Error(error.details[0].message);
                    }
                }
                next();
            } catch (err) {
                console.error("Validation error: ", err);
                next(err);
            }
        }
    }

    // body(schemaName) {
    //     return this.#validate(schemaName, "body");
    // }

    // query(schemaName) {
    //     return this.#validate(schemaName, "query");
    // }

    // param(schemaName) {
    //     return this.#validate(schemaName, "param");
    // }
}
export default Validator