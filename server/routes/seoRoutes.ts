import express from 'express';
import Product from '../models/Product';
import Category from '../models/Category';

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.APP_URL || 'https://piloneko.com';
    
    // Get all active products and categories
    const products = await Product.find({ isActive: true }).select('slug updatedAt').lean();
    const categories = await Category.find().select('slug').lean();
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/game-topup</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

    // Add categories
    categories.forEach(cat => {
      xml += `  <url>
    <loc>${baseUrl}/?category=${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    });

    // Add products
    products.forEach(prod => {
      xml += `  <url>
    <loc>${baseUrl}/product/${prod.slug}</loc>
    <lastmod>${new Date(prod.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).end();
  }
});

// robots.txt handler
router.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.APP_URL || 'https://piloneko.com';
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`);
});

export default router;
