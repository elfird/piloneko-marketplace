export interface IProductService {
  getPublicProducts(categorySlug?: string, isFeatured?: boolean): Promise<any[]>;
  getPublicProductDetails(slug: string): Promise<any>;
  getAdminProducts(): Promise<any[]>;
  createProduct(data: any): Promise<any>;
  updateProduct(id: string, data: any): Promise<any>;
  deleteProduct(id: string): Promise<any>;
  addPackage(productId: string, packageData: any): Promise<any>;
  updatePackage(productId: string, packageId: string, packageData: any): Promise<any>;
  deletePackage(productId: string, packageId: string): Promise<any>;
}
