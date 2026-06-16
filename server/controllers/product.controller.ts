import { Request, Response } from 'express';
import { IProductService } from '../interfaces/IProductService';
import { catchAsync } from '../utils/catchAsync';

export class ProductController {
  constructor(private productService: IProductService) {}

  public getPublicAll = catchAsync(async (req: Request, res: Response) => {
    const categorySlug = req.query.categorySlug as string | undefined;
    const isFeatured = req.query.isFeatured === 'true' ? true : undefined;
    const products = await this.productService.getPublicProducts(categorySlug, isFeatured);
    res.json(products);
  });

  public getPublicDetail = catchAsync(async (req: Request, res: Response) => {
    const product = await this.productService.getPublicProductDetails(req.params.slug);
    res.json(product);
  });

  public getAdminAll = catchAsync(async (req: Request, res: Response) => {
    const products = await this.productService.getAdminProducts();
    res.json(products);
  });

  public create = catchAsync(async (req: Request, res: Response) => {
    const product = await this.productService.createProduct(req.body);
    res.json({ success: true, product });
  });

  public update = catchAsync(async (req: Request, res: Response) => {
    const product = await this.productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, product });
  });

  public delete = catchAsync(async (req: Request, res: Response) => {
    await this.productService.deleteProduct(req.params.id);
    res.json({ success: true });
  });

  public addPackage = catchAsync(async (req: Request, res: Response) => {
    const product = await this.productService.addPackage(req.params.productId, req.body);
    res.json({ success: true, product });
  });

  public updatePackage = catchAsync(async (req: Request, res: Response) => {
    const product = await this.productService.updatePackage(req.params.productId, req.params.packageId, req.body);
    res.json({ success: true, product });
  });

  public deletePackage = catchAsync(async (req: Request, res: Response) => {
    const product = await this.productService.deletePackage(req.params.productId, req.params.packageId);
    res.json({ success: true, product });
  });
}
