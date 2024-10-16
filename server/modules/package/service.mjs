import { Service } from "../../utils/base.mjs"
import PackageModel from "./model.mjs";
import constants from "../../utils/constants.mjs";


const { GENERIC_POST_REQ_SUCCESS_MESSAGE, GENERIC_DELETE_REQ_SUCCESS_MESSAGE, GENERIC_UPDATE_REQ_SUCCESS_MESSAGE, GENERIC_GET_REQ_SUCCESS_MESSAGE } = constants;
class PackageService extends Service {
    constructor() {
        super();
        //this.listPackage = this.listPackage.bind(this);
        // this.createPackage = this.createPackage.bind(this);
        // this.updatePackage = this.updatePackage.bind(this);
        // this.removePackage = this.removePackage.bind(this);
    }
    listPackage = async (req) => {
        const data = await this.list(req, PackageModel);
        return {
            success: true,
            info: `${GENERIC_GET_REQ_SUCCESS_MESSAGE} ${data.length ? "the list of packages" : "the package"}.`,
            data
        };
    }

    createPackage = async (req) => {
        const data = await this.create(req, PackageModel);
        return {
            success: true,
            info: `${GENERIC_POST_REQ_SUCCESS_MESSAGE} a package.`,
            data
        };
    }

    updatePackage = async (req) => {
        const data = await this.update(req, PackageModel);
        return {
            success: true,
            info: `${GENERIC_UPDATE_REQ_SUCCESS_MESSAGE} a package.`,
            data
        };
    }

    removePackage = async (req) => {
        const data = await this.remove(req, PackageModel);
        return {
            success: true,
            info: `${GENERIC_DELETE_REQ_SUCCESS_MESSAGE} a package.`,
            data
        };
    }
}
export default PackageService;