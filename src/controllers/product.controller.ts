import { Response } from 'express';
import { validationResult } from 'express-validator';
import Product from '../models/Product';
import Profile from '../models/Profile';
import { AuthRequest } from '../middleware/auth';
import { get18KGoldPrice, calculateGoldEquivalent } from '../services/goldPrice.service';
import { calculateSavingsTimeline } from '../utils/savingsCalculator';

// Helper function to enrich products with savings timeline
const enrichProductWithTimeline = async (product: any, userId: string) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile || profile.monthlySalary <= 0) {
      return { ...product.toObject(), timeline: null };
    }

    const timeline = calculateSavingsTimeline(
      product.price,
      product.goldEquivalent,
      profile.monthlySalary,
      profile.monthlySavingsPercentage,
      product.savedGoldAmount
    );

    return { ...product.toObject(), timeline };
  } catch (error) {
    return { ...product.toObject(), timeline: null };
  }
};

export const getProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const products = await Product.find({ userId }).sort({ createdAt: -1 });

    // Enrich products with timeline data
    const enrichedProducts = await Promise.all(
      products.map((product) => enrichProductWithTimeline(product, userId!))
    );

    res.status(200).json({ products: enrichedProducts });
  } catch (error: any) {
    console.error('GetProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const product = await Product.findOne({ _id: id, userId });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json({ product });
  } catch (error: any) {
    console.error('GetProductById error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId;
    const { name, price, isWishlisted, savedGoldAmount } = req.body;

    // Fetch current 18K gold price
    const goldPrice = await get18KGoldPrice();
    const goldEquivalent = calculateGoldEquivalent(price, goldPrice);

    const product = new Product({
      userId,
      name,
      price,
      goldEquivalent,
      goldPriceAtCreation: goldPrice,
      isWishlisted: isWishlisted || false,
      savedGoldAmount: savedGoldAmount || 0,
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error: any) {
    console.error('CreateProduct error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const userId = req.userId;

    const product = await Product.findOne({ _id: id, userId });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const { name, price, isWishlisted, savedGoldAmount } = req.body;

    if (name !== undefined) product.name = name;

    // If price is updated, recalculate gold equivalent
    if (price !== undefined) {
      product.price = price;
      const goldPrice = await get18KGoldPrice();
      product.goldEquivalent = calculateGoldEquivalent(price, goldPrice);
      product.goldPriceAtCreation = goldPrice;
    }

    if (isWishlisted !== undefined) product.isWishlisted = isWishlisted;
    if (savedGoldAmount !== undefined) product.savedGoldAmount = savedGoldAmount;

    await product.save();

    res.status(200).json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error: any) {
    console.error('UpdateProduct error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const product = await Product.findOneAndDelete({ _id: id, userId });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('DeleteProduct error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const toggleWishlist = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const product = await Product.findOne({ _id: id, userId });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    product.isWishlisted = !product.isWishlisted;
    await product.save();

    res.status(200).json({
      message: 'Wishlist status updated',
      product,
    });
  } catch (error: any) {
    console.error('ToggleWishlist error:', error);
    res.status(500).json({ error: 'Failed to toggle wishlist' });
  }
};

export const getWishlistedProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const products = await Product.find({ userId, isWishlisted: true }).sort({
      createdAt: -1,
    });

    // Enrich products with timeline data
    const enrichedProducts = await Promise.all(
      products.map((product) => enrichProductWithTimeline(product, userId!))
    );

    res.status(200).json({ products: enrichedProducts });
  } catch (error: any) {
    console.error('GetWishlistedProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlisted products' });
  }
};
