import { ProductHttpService } from "./core/product/product";
import { ProductMasterHttpService } from "./core/product/productmaster";
import { ShopHttpService } from "./core/shop/shop";
import { CategoryHttpService } from "./core/category/category";
const shopHttpService = new ShopHttpService();
const productHttpService = new ProductHttpService();
const productMasterHttpService = new ProductMasterHttpService();
const categoryHttpService = new CategoryHttpService();

const CoreAPI = {
    shopHttpService,
    productHttpService,
    productMasterHttpService,
    categoryHttpService,
};

export default CoreAPI;