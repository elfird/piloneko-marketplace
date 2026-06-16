import { ICategoryRepository } from '../interfaces/ICategoryRepository';
import { ICategoryService } from '../interfaces/ICategoryService';

export class CategoryService implements ICategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  public async getAllCategories() {
    return await this.categoryRepository.findAll();
  }

  public async createCategory(data: any) {
    return await this.categoryRepository.create(data);
  }

  public async updateCategory(id: string, data: any) {
    return await this.categoryRepository.update(id, data);
  }

  public async deleteCategory(id: string) {
    return await this.categoryRepository.delete(id);
  }

  public async reorderCategories(orders: { id: string, sortOrder: number }[]) {
    return await this.categoryRepository.reorder(orders);
  }
}
