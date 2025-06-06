import { ProductHttpService } from "./core/product/product";
import { ProductMasterHttpService } from "./core/product/productmaster";
import { ShopHttpService } from "./core/shop/shop";
import { CategoryHttpService } from "./core/category/category";
import { CutomerHttpService } from "./core/customer/customerService";
import { SettingHttpService } from "./core/setting/setting";
const shopHttpService = new ShopHttpService();
const productHttpService = new ProductHttpService();
const productMasterHttpService = new ProductMasterHttpService();
const categoryHttpService = new CategoryHttpService();
const customerHttpService = new CutomerHttpService();
const settingHttpService = new SettingHttpService()

const CoreAPI = {
    shopHttpService,
    productHttpService,
    productMasterHttpService,
    categoryHttpService,
    customerHttpService,
    settingHttpService,
};

export default CoreAPI;