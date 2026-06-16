import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useInitialData() {
  const { 
    setSiteContent, 
    setCategories, 
    setProducts, 
    setTestimonials, 
    setFaqs, 
    setBanners, 
    setFlashSale, 
    setLoading, 
    setMidtransActive,
    setDigiflazzActive,
  } = useStore();

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const [resContent, resCat, resProd, resFlash, resTest, resFaq, resBanners, resPayConfig] = await Promise.all([
          fetch("/api/site-content"),
          fetch("/api/categories"),
          fetch("/api/products"),
          fetch("/api/flash-sales"),
          fetch("/api/testimonials"),
          fetch("/api/faqs"),
          fetch("/api/banners"),
          fetch("/api/payment/config"),
        ]);

        if (resContent.ok) {
          const rawContent = await resContent.json();
          const mappedContent: Record<string, string> = {};
          rawContent.forEach((item: any) => {
            mappedContent[item.key] = item.value;
          });
          setSiteContent(mappedContent);
          
          if (resFlash.ok) {
            setFlashSale(mappedContent.flash_sale_active === "true", mappedContent.flash_sale_ends_at || "", await resFlash.json());
          }
        }
        
        if (resCat.ok) setCategories(await resCat.json());
        if (resProd.ok) setProducts(await resProd.json());
        if (resTest.ok) setTestimonials(await resTest.json());
        if (resFaq.ok) setFaqs(await resFaq.json());
        if (resBanners.ok) setBanners(await resBanners.json());
        if (resPayConfig.ok) {
          const configData = await resPayConfig.json();
          setMidtransActive(configData.isActive);
          setDigiflazzActive(configData.digiflazzActive);
        }
        
      } catch (err) {
        console.error("Failed to initialize store data:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [setSiteContent, setCategories, setProducts, setTestimonials, setFaqs, setBanners, setFlashSale, setLoading, setMidtransActive, setDigiflazzActive]);
}
