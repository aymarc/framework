import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { ErrorMessage } from "./error.mjs";


// Create a settings for multer
let uploadStorage = multer.diskStorage({
    destination: (req, file, done) => {

        if (!file) {
            return done(new Error('Upload file error'), null);
        }

        const fileExits = existsSync(resolve(process.cwd(), `${config.UPLOAD_DIRECTORY}/${file.originalname}`))
        if (!fileExits) {
            return done(null, resolve(process.cwd(), config.UPLOAD_DIRECTORY));
        }

        unlink(resolve(process.cwd(), `${config.UPLOAD_DIRECTORY}/${file.originalname}`), (error) => {
            if (error) {
                return done(error);
            }
            return done(null, resolve(process.cwd(), `${config.UPLOAD_DIRECTORY}`))
        })
    },

    filename: (req, file, done) => {
        if (file) {
            const extFile = file.originalname.replace('.', '');
            const extPattern = /(jpg|jpeg|png|gif|svg)/gi.test(extFile);
            if (!extPattern) return done(new TypeError('File format is not valid'), null);
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const newFileName = uniqueSuffix + '-' + file.originalname;
            return done(null, newFileName);
        }
    }
})

if (config.MULTER_STORAGE_TYPE === "2") {
    uploadStorage = multer.memoryStorage();
}

export default class Utils {

    exeCmd(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);  // Reject the Promise with the error
                    return;
                }
                if (stderr) {
                    reject(new Error(stderr));  // Optionally reject on stderr
                    return;
                }
                resolve(stdout);  // Resolve the Promise with the output
            });
        });
    }


    // Function to search for a specific folder and file within it
    searchFolderAndFile(startDir, folderName, ignoreFolders, fileName) {
        // Check if the start directory exists
        if (!fs.existsSync(startDir)) {
            throw new ErrorMessage(`Directory ${startDir} does not exist.`);
        }
        const result = {};
        // Traverse the directory to find the folder
        const directories = fs.readdirSync(startDir, { withFileTypes: true });

        for (const dirent of directories) {
            const fullPath = path.join(startDir, dirent.name);
            if (ignoreFolders.includes(dirent.name)) {
                continue;
            }
            // If the directory matches the folderName
            if (dirent.isDirectory() && dirent.name === folderName) {
                result.folder = fullPath;
                //console.log(`Folder found: ${fullPath}`);
                // Check if the file exists in the folder
                const folderContents = fs.readdirSync(fullPath);
                if (folderContents.includes(fileName)) {
                    result.file = true;
                    //console.log(`File ${fileName} found in folder ${folderName}`);
                } else {
                    console.info(`File ${fileName} not found in folder ${folderName}`);
                }

                return; // Exit after finding the folder and file
            }
        }
        return result;
    }

    // Function to delete a folder and its contents
    deleteFolderRecursive(folderPath) {
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
            console.info(`Folder ${folderPath} deleted.`);
        }
    }

    fileUploader = multer({ storage: uploadStorage, limits: 1000000 });

    bodyValidator(schemaName) {
        if (!schemaName) {
            throw new ErrorMessage("No schema suplied to validator");
        }

        return async (req, res, next) => {
            try {
                const { error } = schemaName.validate(req.body);
                if (error) {
                    throw new ValidationError(error.details[0].message);
                }

                next();
            } catch (err) {
                console.error("catch error ", err);
                next(err);
            }
        }
    }

    async processFile(path, i) {
        const timestamp = new Date().toISOString().replace(/:/g, '_') + i + '_' + Math.round(Math.random() * 1E9);
        const newFilePath = `/${timestamp}.webp`.toString();

        const image = await Jimp.read(path);
        image.quality(80); // Adjust image quality (0-100)
        await image.writeAsync(`uploads${newFilePath}`);

        unlinkSync(path, (error) => {
            if (error) {
                console.error(error);
            }
        })
        return newFilePath;
    }
    compressFile = async (req, res, next) => {
        try {

            if (!req.file && !req.files) {
                return;
            }

            let allFiles = [], fileUrls = {};
            if (req.files) {
                allFiles = req.files;
            } else {
                allFiles = [req.file];
            }

            const fields = Object.keys(allFiles);
            for (let i = 0; i < fields.length; i++) {
                let originalname = "", path = "", fieldname = "", newFilePath = "", main = {}, secondary = {};

                if (fields[i] === "main") {
                    originalname = allFiles.main[0]?.originalname;
                    path = allFiles.main[0]?.path;
                    newFilePath = await this.processFile(path, i);
                    fileUrls["main"] = { assetUrl: newFilePath, originalAssetUrl: originalname };

                } else if (fields[i] === "imageSecondary") {
                    for (const [key, sec] of allFiles["imageSecondary"].entries()) {
                        originalname = sec["originalname"];
                        path = sec["path"];
                        fieldname = sec["fieldname"];
                        newFilePath = await this.processFile(path, i);
                        fileUrls[`imageSecondary${key + 1}`] = { assetUrl: newFilePath, originalAssetUrl: originalname };
                    }
                }

            }

            if (Object.keys(fileUrls).length > 0) {
                req.fileUrls = fileUrls
            }

            next();
        } catch (err) {
            console.error('Error:', err);
            return next(err);
        }
    }

    auth = async (req, res, next, service = false) => {

        try {
            let authHeader = req.body.token || req.query.token || req.headers.authorization;
            req.headers.user = await this.verifyUser(authHeader, true);
            if (service) {
                return req.headers.user;
            }

        } catch (err) {
            return next(err);
        }
        return next();
    };

    async verifyUser(authHeader, throwError = null, roleRequirement = null) {
        try {
            let token = "";

            //check authorization token. If none throw Authentication exception
            if (!authHeader) {
                console.error("\n Auth Error: 'No access token supplied.'");
                throw new AuthenticationError("Kindly Login to proceed.");
            }

            //retrieve token from bearer token
            if (typeof authHeader !== undefined) {
                token = authHeader.split(' ')[1];
            }

            //decode token and verify if valid
            const secret_key = config.APP_KEY;
            let decoded = "";
            let isNotDecoded = false;
            jwt.verify(token, secret_key, (err, data) => {
                if (err) {
                    isNotDecoded = true;
                }
                decoded = data;
            });

            if (isNotDecoded) {
                throw new AuthenticationError("Kindly Login to proceed.");
            }
            //if token valid, check if token has a valid session. If not throw Authentication exception
            let activeSessionOwner = await tokenService.get(decoded.id)
            activeSessionOwner = JSON.parse(activeSessionOwner);
            if (!activeSessionOwner && throwError) {
                throw new AuthenticationError("Kindly Login to proceed.");
            };
            //if session exist verify ownwer's name is retrieve successfully. If not throw Authentication exception
            if ((activeSessionOwner.id !== decoded.id) && throwError) {
                throw new AuthenticationError("Kindly Login to proceed.");
            }

            if (roleRequirement && activeSessionOwner?.role?.roleName !== roleRequirement) {
                throw new AuthenticationError("You don't have permisison to perform ths operation.");
            }
            return decoded;
        } catch (err) {
            console.error("Error in VerifyUser", err?.message);
        }

    }


}