export interface ICategoryService {
  getAllCategories(): Promise<any[]>;
  createCategory(data: any): Promise<any>;
  updateCategory(id: string, data: any): Promise<any>;
  deleteCategory(id: string): Promise<any>;
  reorderCategories(orders: { id: string, sortOrder: number }[]): Promise<void>;
}
