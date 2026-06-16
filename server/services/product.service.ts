import { IProductRepository } from '../interfaces/IProductRepository';
import { IProductService } from '../interfaces/IProductService';

export class ProductService implements IProductService {
  constructor(private productRepository: IProductRepository) {}

  public async getPublicProducts(categorySlug?: string, isFeatured?: boolean) {
    return await this.productRepository.findPublic(categorySlug, isFeatured);
  }

  public async getPublicProductDetails(slug: string) {
    return await this.productRepository.findPublicBySlug(slug);
  }

  public async getAdminProducts() {
    return await this.productRepository.findAllAdmin();
  }

  public async createProduct(data: any) {
    return await this.productRepository.create(data);
  }

  public async updateProduct(id: string, data: any) {
    return await this.productRepository.update(id, data);
  }

  public async deleteProduct(id: string) {
    return await this.productRepository.delete(id);
  }

  public async addPackage(productId: string, packageData: any) {
    return await this.productRepository.addPackage(productId, packageData);
  }

  public async updatePackage(productId: string, packageId: string, packageData: any) {
    return await this.productRepository.updatePackage(productId, packageId, packageData);
  }

  public async deletePackage(productId: string, packageId: string) {
    return await this.productRepository.deletePackage(productId, packageId);
  }
}
