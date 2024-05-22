import { Controller } from "../../utils/base.mjs"
import PackageValidation from "./validation.mjs";
import PackageService from "./service.mjs"

const packageValidation = new PackageValidation();
const packageService = new PackageService();
class PackageController extends Controller {
    constructor() {
        super();
    }

    init() {
        this.route('/package', 'GET', packageValidation.list(), packageService.listPackage);
        this.route('/package/:_id', 'GET', packageValidation.list(), packageService.listPackage);
        this.route('/package', 'POST', packageValidation.create(), packageService.createPackage);
        this.route('/package/:_id', 'PUT', packageValidation.update(), packageService.updatePackage);
        this.route('/package/:_id', 'DELETE', packageValidation.remove(), packageService.removePackage);
        return this.routes;
    }

}

export default PackageController 
