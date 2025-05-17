import { ProductHttpService } from "./core/product/product";
import { ShopHttpService } from "./core/shop/shop";
const shopHttpService = new ShopHttpService();
const productHttpService = new ProductHttpService();
const CoreAPI = {
    shopHttpService,
    productHttpService
};

export default CoreAPI;