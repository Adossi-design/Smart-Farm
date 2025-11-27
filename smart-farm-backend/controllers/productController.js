const { Product, User } = require('../models');
const { Op } = require('sequelize');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';
const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

const uploadToSupabase = async (file) => {
  if (!file) return null;
  if (!supabase) {
    throw new Error('Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
  const objectKey = `products/${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;

  const { error } = await supabase.storage
    .from(storageBucket)
    .upload(objectKey, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(storageBucket).getPublicUrl(objectKey);
  return data?.publicUrl;
};

exports.getProducts = async (req, res) => {
  try {
    const { keyword, category } = req.query;
    let where = {};

    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }
    if (category && category !== 'All') {
      where.category = category;
    }

    const products = await Product.findAll({
      where,
      include: [{ model: User, as: 'seller', attributes: ['name', 'email', 'phone'] }]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: User, as: 'seller', attributes: ['name', 'email', 'phone'] }]
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, quantity, location, description, whatsapp, imageUrl } = req.body;
    
    let imagePath = imageUrl || req.body.image || '';
    if (req.file) {
      imagePath = await uploadToSupabase(req.file);
    }

    const product = await Product.create({
      name,
      category,
      price,
      quantity,
      location,
      description,
      image: imagePath,
      whatsapp: whatsapp || req.user.phone || req.user.email,
      sellerId: req.user.id
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ where: { sellerId: req.user.id } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, category, price, quantity, location, description, whatsapp, imageUrl } = req.body;
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check ownership
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    // Image handling
    let imagePath = product.image;
    if (req.file) {
      imagePath = await uploadToSupabase(req.file);
    } else if (imageUrl) {
      imagePath = imageUrl;
    }

    product.name = name || product.name;
    product.category = category || product.category;
    product.price = price || product.price;
    product.quantity = quantity || product.quantity;
    product.location = location || product.location;
    product.description = description || product.description;
    product.whatsapp = whatsapp || product.whatsapp;
    product.image = imagePath;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.destroy();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};