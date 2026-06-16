export interface ICategoryRepository {
  findAll(): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<any>;
  reorder(orders: { id: string, sortOrder: number }[]): Promise<void>;
}
