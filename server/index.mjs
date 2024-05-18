import express from "express";
import Middleware from "./utils/middleware.mjs";
import config from "./config.mjs";

//
const app = express();
const middleware = new Middleware(app, config);
const PORT = config.PORT;

middleware.catchNotFoundRoute();
middleware.catchErrors();
app.listen(PORT, (err) => {
    if (err) {
        console.error("Can not start server: ", err);
        return;
    }
    console.log(`Listening on port ${PORT}`);
})