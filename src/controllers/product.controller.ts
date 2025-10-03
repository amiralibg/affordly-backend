import { Response } from 'express';
import { validationResult } from 'express-validator';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const getProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const products = await Product.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ products });
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
    const { name, price, monthlySavings, isWishlisted, savedAmount } = req.body;

    const product = new Product({
      userId,
      name,
      price,
      monthlySavings,
      isWishlisted: isWishlisted || false,
      savedAmount: savedAmount || 0,
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

    const { name, price, monthlySavings, isWishlisted, savedAmount } = req.body;

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (monthlySavings !== undefined) product.monthlySavings = monthlySavings;
    if (isWishlisted !== undefined) product.isWishlisted = isWishlisted;
    if (savedAmount !== undefined) product.savedAmount = savedAmount;

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

    res.status(200).json({ products });
  } catch (error: any) {
    console.error('GetWishlistedProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlisted products' });
  }
};
