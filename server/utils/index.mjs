import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { ErrorMessage } from "./error.mjs";

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
}