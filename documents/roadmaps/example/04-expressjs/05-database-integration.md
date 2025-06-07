# Database Integration trong ExpressJS

## Mục lục
1. [MongoDB với Mongoose](#mongodb-với-mongoose)
2. [MySQL với Sequelize](#mysql-với-sequelize)
3. [PostgreSQL Integration](#postgresql-integration)
4. [Redis Integration](#redis-integration)
5. [Database Connection Management](#database-connection-management)
6. [ORM/ODM Best Practices](#ormodm-best-practices)
7. [Database Security](#database-security)
8. [Ví dụ thực tế](#ví-dụ-thực-tế)

## MongoDB với Mongoose

### Setup và Connection

```javascript
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

connectDB();
```

### Mongoose Schemas và Models

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username là bắt buộc'],
    unique: true,
    trim: true,
    minlength: [3, 'Username phải ít nhất 3 ký tự'],
    maxlength: [20, 'Username không quá 20 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Password là bắt buộc'],
    minlength: [8, 'Password phải ít nhất 8 ký tự'],
    select: false // Không trả về password trong queries
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: {
      type: String,
      maxlength: [500, 'Bio không quá 500 ký tự']
    },
    dateOfBirth: Date,
    location: String
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual properties
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'profile.firstName': 1, 'profile.lastName': 1 });

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Chỉ hash password khi password được modify
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

userSchema.methods.incrementLoginAttempts = function() {
  // Nếu có lockUntil và đã hết thời gian lock
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        loginAttempts: 1,
        lockUntil: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account sau 5 lần thử sai
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // Lock 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Static methods
userSchema.statics.getFailedLogin = function() {
  return {
    isLocked: true,
    lockUntil: { $gt: Date.now() }
  };
};

const User = mongoose.model('User', userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên sản phẩm là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên sản phẩm không quá 100 ký tự']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Mô tả sản phẩm là bắt buộc'],
    maxlength: [2000, 'Mô tả không quá 2000 ký tự']
  },
  price: {
    type: Number,
    required: [true, 'Giá sản phẩm là bắt buộc'],
    min: [0, 'Giá phải lớn hơn 0']
  },
  comparePrice: {
    type: Number,
    validate: {
      validator: function(value) {
        return !value || value > this.price;
      },
      message: 'Giá so sánh phải lớn hơn giá bán'
    }
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Danh mục là bắt buộc']
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  inventory: {
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Số lượng không thể âm']
    },
    sku: {
      type: String,
      unique: true,
      sparse: true
    },
    trackQuantity: {
      type: Boolean,
      default: true
    }
  },
  attributes: [{
    name: String,
    value: String
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Pre-save để tạo slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

// Category Schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  image: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
```

### CRUD Operations với Mongoose

```javascript
app.use(express.json());

// Create User
app.post('/api/users', async (req, res) => {
  try {
    const { username, email, password, profile } = req.body;
    
    const user = new User({
      username,
      email,
      password,
      profile
    });
    
    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      message: 'User được tạo thành công',
      user: userResponse
    });
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        error: `${field} đã tồn tại` 
      });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Users với pagination và filtering
app.get('/api/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    if (req.query.search) {
      filter.$or = [
        { username: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { 'profile.firstName': { $regex: req.query.search, $options: 'i' } },
        { 'profile.lastName': { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Execute query
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Faster queries
    
    const total = await User.countDocuments(filter);
    
    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get User by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('createdProducts', 'name price');
    
    if (!user) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }
    
    res.json({ user });
    
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Update User
app.put('/api/users/:id', async (req, res) => {
  try {
    const { username, email, profile, role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(username && { username }),
        ...(email && { email }),
        ...(profile && { profile }),
        ...(role && { role })
      },
      {
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }
    
    res.json({
      message: 'User được cập nhật thành công',
      user
    });
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Products with complex queries
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Build aggregation pipeline
    const pipeline = [
      // Match stage
      {
        $match: {
          isActive: true,
          ...(req.query.category && { category: new mongoose.Types.ObjectId(req.query.category) }),
          ...(req.query.minPrice && { price: { $gte: parseFloat(req.query.minPrice) } }),
          ...(req.query.maxPrice && { price: { $lte: parseFloat(req.query.maxPrice) } }),
          ...(req.query.search && {
            $or: [
              { name: { $regex: req.query.search, $options: 'i' } },
              { description: { $regex: req.query.search, $options: 'i' } },
              { tags: { $in: [new RegExp(req.query.search, 'i')] } }
            ]
          })
        }
      },
      
      // Lookup category
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      
      // Add computed fields
      {
        $addFields: {
          discountPercentage: {
            $cond: {
              if: '$comparePrice',
              then: {
                $multiply: [
                  { $divide: [{ $subtract: ['$comparePrice', '$price'] }, '$comparePrice'] },
                  100
                ]
              },
              else: 0
            }
          },
          inStock: { $gt: ['$inventory.quantity', 0] }
        }
      },
      
      // Sort
      {
        $sort: {
          ...(req.query.sort === 'price-asc' && { price: 1 }),
          ...(req.query.sort === 'price-desc' && { price: -1 }),
          ...(req.query.sort === 'name' && { name: 1 }),
          ...(!req.query.sort && { createdAt: -1 })
        }
      },
      
      // Pagination
      { $skip: skip },
      { $limit: limit },
      
      // Project
      {
        $project: {
          name: 1,
          slug: 1,
          price: 1,
          comparePrice: 1,
          discountPercentage: 1,
          images: { $slice: ['$images', 1] }, // Chỉ lấy image đầu tiên
          'categoryInfo.name': 1,
          'categoryInfo.slug': 1,
          inStock: 1,
          createdAt: 1
        }
      }
    ];
    
    const products = await Product.aggregate(pipeline);
    
    // Count total (for pagination)
    const countPipeline = pipeline.slice(0, -3); // Remove skip, limit, project
    countPipeline.push({ $count: 'total' });
    const countResult = await Product.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;
    
    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

## MySQL với Sequelize

### Setup và Configuration

```javascript
const { Sequelize, DataTypes } = require('sequelize');

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true, // Use snake_case
      paranoid: true // Soft deletes
    }
  }
);

// Test connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connection established successfully.');
    
    // Sync models (only in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database synchronized');
    }
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

connectDB();
```

### Sequelize Models

```javascript
// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      isAlphanumeric: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [8, 255]
    }
  },
  firstName: {
    type: DataTypes.STRING(50),
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(50),
    field: 'last_name'
  },
  avatar: DataTypes.STRING(255),
  role: {
    type: DataTypes.ENUM('user', 'admin', 'moderator'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'email_verified'
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login'
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['email'] },
    { fields: ['username'] },
    { fields: ['role'] }
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`.trim();
};

// Class methods
User.findByEmail = function(email) {
  return this.findOne({ where: { email } });
};

// Product Model
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  slug: {
    type: DataTypes.STRING(250),
    unique: true,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  comparePrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'compare_price',
    validate: {
      min: 0,
      isGreaterThanPrice(value) {
        if (value && value <= this.price) {
          throw new Error('Compare price must be greater than price');
        }
      }
    }
  },
  sku: {
    type: DataTypes.STRING(100),
    unique: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  weight: DataTypes.DECIMAL(8, 3),
  dimensions: DataTypes.JSON,
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
  }
}, {
  tableName: 'products',
  indexes: [
    { fields: ['slug'] },
    { fields: ['sku'] },
    { fields: ['category_id'] },
    { fields: ['is_active'] },
    { fields: ['price'] }
  ],
  hooks: {
    beforeSave: (product) => {
      if (product.changed('name')) {
        product.slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    }
  }
});

// Category Model
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  slug: {
    type: DataTypes.STRING(120),
    unique: true,
    allowNull: false
  },
  description: DataTypes.TEXT,
  image: DataTypes.STRING(255),
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'categories'
});

// Associations
User.hasMany(Product, { foreignKey: 'createdBy', as: 'products' });
Product.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Self-referencing for category hierarchy
Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });
```

### Sequelize CRUD Operations

```javascript
// Create Product
app.post('/api/products', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      name, description, price, comparePrice,
      categoryId, sku, quantity, images, tags
    } = req.body;
    
    const product = await Product.create({
      name,
      description,
      price,
      comparePrice,
      categoryId,
      sku,
      quantity,
      images,
      tags,
      createdBy: req.user.id
    }, { transaction });
    
    await transaction.commit();
    
    // Fetch with associations
    const productWithAssociations = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'creator', attributes: ['username', 'email'] }
      ]
    });
    
    res.status(201).json({
      message: 'Product created successfully',
      product: productWithAssociations
    });
    
  } catch (error) {
    await transaction.rollback();
    
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ error: errors });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Product with this SKU already exists' 
      });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Products với complex queries
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    // Build where clause
    const where = { isActive: true };
    
    if (req.query.category) {
      where.categoryId = req.query.category;
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) where.price[Op.gte] = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) where.price[Op.lte] = parseFloat(req.query.maxPrice);
    }
    
    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { description: { [Op.like]: `%${req.query.search}%` } }
      ];
    }
    
    // Build order
    const order = [];
    if (req.query.sort === 'price-asc') order.push(['price', 'ASC']);
    else if (req.query.sort === 'price-desc') order.push(['price', 'DESC']);
    else if (req.query.sort === 'name') order.push(['name', 'ASC']);
    else order.push(['createdAt', 'DESC']);
    
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name', 'slug']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['username']
        }
      ],
      order,
      limit,
      offset,
      distinct: true
    });
    
    res.json({
      products,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Raw queries for complex analytics
app.get('/api/analytics/products', async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        c.name as category_name,
        COUNT(p.id) as product_count,
        AVG(p.price) as avg_price,
        MIN(p.price) as min_price,
        MAX(p.price) as max_price,
        SUM(p.quantity) as total_quantity
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id, c.name
      ORDER BY product_count DESC
    `);
    
    res.json({ analytics: results });
    
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

## PostgreSQL Integration

### Setup với node-postgres

```javascript
const { Pool } = require('pg');

// Connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  max: 20, // Maximum clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Database query helper
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

// Transaction helper
const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
```

### PostgreSQL Queries

```javascript
// Create tables
const createTables = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        avatar VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(120) UNIQUE NOT NULL,
        description TEXT,
        image VARCHAR(255),
        parent_id UUID REFERENCES categories(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(250) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
        compare_price DECIMAL(10,2) CHECK (compare_price > price),
        sku VARCHAR(100) UNIQUE,
        quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
        images JSONB DEFAULT '[]',
        tags JSONB DEFAULT '[]',
        category_id UUID REFERENCES categories(id),
        created_by UUID REFERENCES users(id),
        is_active BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags)`);
    
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

// CRUD operations
const userService = {
  async create(userData) {
    const { username, email, password, firstName, lastName } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await query(`
      INSERT INTO users (username, email, password, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, first_name, last_name, role, created_at
    `, [username, email, hashedPassword, firstName, lastName]);
    
    return result.rows[0];
  },
  
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },
  
  async findById(id) {
    const result = await query(`
      SELECT id, username, email, first_name, last_name, avatar, role, 
             is_active, email_verified, last_login, created_at
      FROM users WHERE id = $1
    `, [id]);
    return result.rows[0];
  },
  
  async updateLastLogin(id) {
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }
};

const productService = {
  async create(productData) {
    return await withTransaction(async (client) => {
      const {
        name, description, price, comparePrice, sku,
        quantity, images, tags, categoryId, createdBy
      } = productData;
      
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const result = await client.query(`
        INSERT INTO products (
          name, slug, description, price, compare_price, sku,
          quantity, images, tags, category_id, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        name, slug, description, price, comparePrice, sku,
        quantity, JSON.stringify(images), JSON.stringify(tags),
        categoryId, createdBy
      ]);
      
      return result.rows[0];
    });
  },
  
  async findWithFilters(filters) {
    const { page = 1, limit = 12, category, minPrice, maxPrice, search, sort } = filters;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE p.is_active = true';
    const params = [];
    let paramCount = 0;
    
    if (category) {
      whereClause += ` AND p.category_id = $${++paramCount}`;
      params.push(category);
    }
    
    if (minPrice) {
      whereClause += ` AND p.price >= $${++paramCount}`;
      params.push(minPrice);
    }
    
    if (maxPrice) {
      whereClause += ` AND p.price <= $${++paramCount}`;
      params.push(maxPrice);
    }
    
    if (search) {
      whereClause += ` AND (p.name ILIKE $${++paramCount} OR p.description ILIKE $${++paramCount})`;
      params.push(`%${search}%`, `%${search}%`);
      paramCount++; // Increment again because we used 2 params
    }
    
    let orderClause = 'ORDER BY p.created_at DESC';
    if (sort === 'price-asc') orderClause = 'ORDER BY p.price ASC';
    else if (sort === 'price-desc') orderClause = 'ORDER BY p.price DESC';
    else if (sort === 'name') orderClause = 'ORDER BY p.name ASC';
    
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM products p
      ${whereClause}
    `, params);
    
    const result = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        u.username as creator_username
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      ${whereClause}
      ${orderClause}
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `, [...params, limit, offset]);
    
    return {
      products: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
      pages: Math.ceil(countResult.rows[0].total / limit)
    };
  }
};
```

## Redis Integration

### Redis Setup và Usage

```javascript
const redis = require('redis');

// Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: 0
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Cache service
const cacheService = {
  async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },
  
  async set(key, data, expiration = 3600) {
    try {
      await redisClient.setex(key, expiration, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },
  
  async del(key) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  },
  
  async exists(key) {
    try {
      return await redisClient.exists(key);
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }
};

// Cache middleware
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }
    
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await cacheService.get(key);
      
      if (cached) {
        return res.json(cached);
      }
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        cacheService.set(key, data, duration);
        originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

// Using cache middleware
app.get('/api/products', cacheMiddleware(600), async (req, res) => {
  // Product logic here
});

// Session store với Redis
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));
```

## Database Connection Management

### Connection Pooling Best Practices

```javascript
// Database manager
class DatabaseManager {
  constructor() {
    this.connections = new Map();
  }
  
  async createConnection(name, config) {
    try {
      let connection;
      
      switch (config.type) {
        case 'mongodb':
          connection = await mongoose.createConnection(config.uri, config.options);
          break;
        case 'mysql':
          connection = new Sequelize(config.database, config.username, config.password, {
            host: config.host,
            dialect: 'mysql',
            pool: config.pool
          });
          await connection.authenticate();
          break;
        case 'postgresql':
          connection = new Pool(config);
          break;
        case 'redis':
          connection = redis.createClient(config);
          break;
        default:
          throw new Error(`Unsupported database type: ${config.type}`);
      }
      
      this.connections.set(name, { connection, config });
      console.log(`${config.type} connection '${name}' established`);
      
      return connection;
    } catch (error) {
      console.error(`Failed to create ${config.type} connection '${name}':`, error);
      throw error;
    }
  }
  
  getConnection(name) {
    const conn = this.connections.get(name);
    if (!conn) {
      throw new Error(`Connection '${name}' not found`);
    }
    return conn.connection;
  }
  
  async closeConnection(name) {
    const conn = this.connections.get(name);
    if (!conn) return;
    
    try {
      switch (conn.config.type) {
        case 'mongodb':
          await conn.connection.close();
          break;
        case 'mysql':
          await conn.connection.close();
          break;
        case 'postgresql':
          await conn.connection.end();
          break;
        case 'redis':
          conn.connection.quit();
          break;
      }
      
      this.connections.delete(name);
      console.log(`Connection '${name}' closed`);
    } catch (error) {
      console.error(`Error closing connection '${name}':`, error);
    }
  }
  
  async closeAllConnections() {
    const promises = Array.from(this.connections.keys()).map(name => 
      this.closeConnection(name)
    );
    await Promise.all(promises);
  }
}

const dbManager = new DatabaseManager();

// Setup connections
const setupDatabases = async () => {
  try {
    // MongoDB connection
    await dbManager.createConnection('mongodb', {
      type: 'mongodb',
      uri: process.env.MONGODB_URI,
      options: {
        useUnifiedTopology: true,
        useNewUrlParser: true
      }
    });
    
    // PostgreSQL connection
    await dbManager.createConnection('postgresql', {
      type: 'postgresql',
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT,
      max: 20,
      idleTimeoutMillis: 30000
    });
    
    // Redis connection
    await dbManager.createConnection('redis', {
      type: 'redis',
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    });
    
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await dbManager.closeAllConnections();
  process.exit(0);
});

setupDatabases();
```

## Database Security

### SQL Injection Prevention

```javascript
// BAD - Vulnerable to SQL injection
app.get('/api/users/:id', async (req, res) => {
  const query = `SELECT * FROM users WHERE id = '${req.params.id}'`;
  // NEVER DO THIS!
});

// GOOD - Using parameterized queries
app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Input validation và sanitization
const { body, param, validationResult } = require('express-validator');

const validateUserId = [
  param('id').isUUID().withMessage('Invalid user ID format')
];

const validateUserInput = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format')
];

app.post('/api/users', validateUserInput, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Proceed with creating user
});
```

## Best Practices

### 1. Connection Management
- Use connection pooling
- Implement proper error handling
- Close connections gracefully
- Monitor connection health

### 2. Query Optimization
- Use indexes effectively
- Avoid N+1 queries
- Implement pagination
- Use projections to limit data

### 3. Security
- Always use parameterized queries
- Validate and sanitize inputs
- Implement proper authentication
- Use least privilege principle

### 4. Performance
- Implement caching strategies
- Use database-specific optimizations
- Monitor query performance
- Consider read replicas

## Exercises

1. **Multi-database Setup**: Implement một app sử dụng cả MongoDB và PostgreSQL
2. **Caching Strategy**: Implement Redis caching cho API responses
3. **Migration System**: Tạo database migration system
4. **Performance Monitoring**: Implement query performance monitoring

## Tổng kết

Database integration là backbone của hầu hết web applications. Chương này đã cover các database systems phổ biến nhất và best practices để integrate chúng với ExpressJS. Việc chọn đúng database và implement properly sẽ quyết định scalability và performance của application.
