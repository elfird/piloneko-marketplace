export interface IProductRepository {
  findPublic(categorySlug?: string, isFeatured?: boolean): Promise<any[]>;
  findPublicBySlug(slug: string): Promise<any>;
  findAllAdmin(): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<any>;
  addPackage(productId: string, packageData: any): Promise<any>;
  updatePackage(productId: string, packageId: string, packageData: any): Promise<any>;
  deletePackage(productId: string, packageId: string): Promise<any>;
}
