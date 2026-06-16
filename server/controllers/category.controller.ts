import { Request, Response } from 'express';
import { ICategoryService } from '../interfaces/ICategoryService';
import { catchAsync } from '../utils/catchAsync';

export class CategoryController {
  constructor(private categoryService: ICategoryService) {}

  public getAll = catchAsync(async (req: Request, res: Response) => {
    const categories = await this.categoryService.getAllCategories();
    // Return direct array for backward compatibility
    res.json(categories);
  });

  public create = catchAsync(async (req: Request, res: Response) => {
    const category = await this.categoryService.createCategory(req.body);
    res.json({ success: true, category });
  });

  public update = catchAsync(async (req: Request, res: Response) => {
    const category = await this.categoryService.updateCategory(req.params.id, req.body);
    res.json({ success: true, category });
  });

  public delete = catchAsync(async (req: Request, res: Response) => {
    await this.categoryService.deleteCategory(req.params.id);
    res.json({ success: true });
  });

  public reorder = catchAsync(async (req: Request, res: Response) => {
    await this.categoryService.reorderCategories(req.body.orders);
    res.json({ success: true });
  });
}
