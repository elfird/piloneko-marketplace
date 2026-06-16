var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/models/Settings.ts
var import_mongoose7, faqItemSchema, FaqItem, waTemplateSchema, WaTemplate, siteContentSchema, SiteContent;
var init_Settings = __esm({
  "server/models/Settings.ts"() {
    import_mongoose7 = __toESM(require("mongoose"));
    faqItemSchema = new import_mongoose7.Schema(
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 }
      }
    );
    faqItemSchema.index({ isActive: 1, sortOrder: 1 });
    FaqItem = import_mongoose7.default.models.FaqItem || import_mongoose7.default.model("FaqItem", faqItemSchema);
    waTemplateSchema = new import_mongoose7.Schema(
      {
        key: { type: String, required: true, unique: true },
        label: { type: String, required: true },
        templateText: { type: String, required: true },
        isActive: { type: Boolean, default: true }
      },
      { timestamps: true }
    );
    WaTemplate = import_mongoose7.default.models.WaTemplate || import_mongoose7.default.model("WaTemplate", waTemplateSchema);
    siteContentSchema = new import_mongoose7.Schema(
      {
        key: { type: String, required: true, unique: true },
        value: { type: String, required: true },
        type: { type: String, required: true }
      }
    );
    SiteContent = import_mongoose7.default.models.SiteContent || import_mongoose7.default.model("SiteContent", siteContentSchema);
  }
});

// server/models/WhatsApp.ts
var import_mongoose17, whatsappSettingsSchema, WhatsAppSettings, whatsappLogSchema, WhatsAppLog, whatsappCampaignSchema, WhatsAppCampaign;
var init_WhatsApp = __esm({
  "server/models/WhatsApp.ts"() {
    import_mongoose17 = __toESM(require("mongoose"));
    whatsappSettingsSchema = new import_mongoose17.Schema(
      {
        whatsappNumber: { type: String, default: "" },
        adminName: { type: String, default: "Admin" },
        fonteToken: { type: String, default: "" },
        deviceId: { type: String, default: "" },
        isConnected: { type: Boolean, default: false },
        // Checkout Settings
        enableWhatsAppCheckout: { type: Boolean, default: true },
        enableMidtransCheckout: { type: Boolean, default: true },
        defaultCheckoutMethod: { type: String, enum: ["WHATSAPP", "MIDTRANS"], default: "MIDTRANS" },
        // Automation Toggles
        autoOrderCreated: { type: Boolean, default: true },
        autoPaymentSuccess: { type: Boolean, default: true },
        autoOrderCompleted: { type: Boolean, default: true },
        autoWarrantyUpdate: { type: Boolean, default: true },
        autoSupportTicketReply: { type: Boolean, default: true },
        autoPaymentReminder: { type: Boolean, default: false },
        paymentReminderDelayHours: { type: Number, default: 1 }
      },
      { timestamps: true }
    );
    WhatsAppSettings = import_mongoose17.default.models.WhatsAppSettings || import_mongoose17.default.model("WhatsAppSettings", whatsappSettingsSchema);
    whatsappLogSchema = new import_mongoose17.Schema(
      {
        phone: { type: String, required: true },
        message: { type: String, required: true },
        status: { type: String, enum: ["SUCCESS", "FAILED", "PENDING"], default: "PENDING" },
        response: { type: String },
        campaignId: { type: import_mongoose17.Schema.Types.ObjectId, ref: "WhatsAppCampaign" }
      },
      { timestamps: true }
    );
    WhatsAppLog = import_mongoose17.default.models.WhatsAppLog || import_mongoose17.default.model("WhatsAppLog", whatsappLogSchema);
    whatsappCampaignSchema = new import_mongoose17.Schema(
      {
        campaignName: { type: String, required: true },
        targetCustomer: { type: String, enum: ["ALL", "HAS_ORDER", "NO_ORDER", "SPECIFIC"], default: "ALL" },
        specificNumbers: [{ type: String }],
        templateKey: { type: String },
        customMessage: { type: String },
        scheduleAt: { type: Date },
        status: { type: String, enum: ["DRAFT", "SCHEDULED", "SENDING", "COMPLETED", "FAILED"], default: "DRAFT" },
        successCount: { type: Number, default: 0 },
        failedCount: { type: Number, default: 0 }
      },
      { timestamps: true }
    );
    WhatsAppCampaign = import_mongoose17.default.models.WhatsAppCampaign || import_mongoose17.default.model("WhatsAppCampaign", whatsappCampaignSchema);
  }
});

// server/services/whatsappService.ts
var whatsappService_exports = {};
__export(whatsappService_exports, {
  decryptToken: () => decryptToken,
  encryptToken: () => encryptToken,
  getWhatsAppSettings: () => getWhatsAppSettings,
  renderWaTemplate: () => renderWaTemplate,
  sendWhatsAppMessage: () => sendWhatsAppMessage,
  testFoonteConnection: () => testFoonteConnection
});
function encryptToken(text) {
  if (!text) return text;
  const iv = import_crypto2.default.randomBytes(IV_LENGTH);
  const cipher = import_crypto2.default.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY2), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}
function decryptToken(text) {
  if (!text || !text.includes(":")) return text;
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = import_crypto2.default.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY2), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
async function getWhatsAppSettings() {
  let settings = await WhatsAppSettings.findOne();
  if (!settings) {
    settings = await WhatsAppSettings.create({
      whatsappNumber: "",
      adminName: "Admin Piloneko",
      fonteToken: "",
      deviceId: "",
      isConnected: false
    });
  }
  return settings;
}
async function testFoonteConnection(encryptedToken) {
  try {
    const token = decryptToken(encryptedToken);
    if (!token) return false;
    const res = await fetch("https://api.fonnte.com/device", {
      method: "POST",
      headers: {
        Authorization: token
      }
    });
    if (res.ok) {
      const data = await res.json();
      return data.status === true;
    }
    return false;
  } catch (error) {
    console.error("Foonte Connection Error:", error);
    return false;
  }
}
async function sendWhatsAppMessage(targetPhone, message, campaignId) {
  const settings = await getWhatsAppSettings();
  if (!settings.isConnected || !settings.fonteToken) {
    console.log("WhatsApp API is not configured or connected.");
    return false;
  }
  const token = decryptToken(settings.fonteToken);
  try {
    let formattedPhone = targetPhone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.substring(1);
    }
    const formData = new FormData();
    formData.append("target", formattedPhone);
    formData.append("message", message);
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token
      },
      body: formData
    });
    const data = await res.json();
    const isSuccess = data.status === true;
    await WhatsAppLog.create({
      phone: formattedPhone,
      message,
      status: isSuccess ? "SUCCESS" : "FAILED",
      response: JSON.stringify(data),
      campaignId: campaignId || void 0
    });
    return isSuccess;
  } catch (error) {
    console.error("Foonte Send Error:", error);
    await WhatsAppLog.create({
      phone: targetPhone,
      message,
      status: "FAILED",
      response: error.message,
      campaignId: campaignId || void 0
    });
    return false;
  }
}
async function renderWaTemplate(templateKey, variables) {
  const template = await WaTemplate.findOne({ key: templateKey, isActive: true });
  if (!template) return null;
  let text = template.templateText;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    text = text.replace(regex, value);
  }
  return text;
}
var import_crypto2, ENCRYPTION_KEY2, IV_LENGTH;
var init_whatsappService = __esm({
  "server/services/whatsappService.ts"() {
    import_crypto2 = __toESM(require("crypto"));
    init_WhatsApp();
    init_Settings();
    ENCRYPTION_KEY2 = process.env.ENCRYPTION_KEY || "piloneko-aes256-key-32chars-2024";
    IV_LENGTH = 16;
  }
});

// server/api.ts
var api_exports = {};
__export(api_exports, {
  default: () => app_default
});
module.exports = __toCommonJS(api_exports);

// server/app.ts
var import_config = require("dotenv/config");
var import_express18 = __toESM(require("express"));
var import_path = __toESM(require("path"));
var import_cookie_parser = __toESM(require("cookie-parser"));
var import_helmet = __toESM(require("helmet"));
var import_cors = __toESM(require("cors"));
var import_hpp = __toESM(require("hpp"));

// server/config/db.ts
var import_mongoose = __toESM(require("mongoose"));
var connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    if (import_mongoose.default.connection.readyState === 1) {
      return;
    }
    if (!global._mongooseConnection) {
      global._mongooseConnection = import_mongoose.default.connect(mongoURI, {
        maxPoolSize: 50,
        serverSelectionTimeoutMS: 5e3,
        socketTimeoutMS: 45e3
      });
    }
    const conn = await global._mongooseConnection;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    global._mongooseConnection = null;
  }
};
var db_default = connectDB;

// server/app.ts
var import_compression = __toESM(require("compression"));
var import_express_rate_limit3 = __toESM(require("express-rate-limit"));

// server/routes/auth.routes.ts
var import_express = __toESM(require("express"));

// server/utils/catchAsync.ts
var catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// server/controllers/auth.controller.ts
var AuthController = class {
  constructor(authService2) {
    this.authService = authService2;
    this.login = catchAsync(async (req, res) => {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1e3
          // 7 days
        });
      }
      return res.status(200).json({
        admin: result.admin,
        token: result.accessToken
      });
    });
    this.getMe = catchAsync(async (req, res) => {
      const adminId = req.admin.id;
      const admin = await this.authService.getMe(adminId);
      res.json({ authorized: true, admin: { name: admin.name, email: admin.email } });
    });
  }
};

// server/services/auth.service.ts
var import_crypto = __toESM(require("crypto"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

// server/models/AdminAndOthers.ts
var import_mongoose2 = __toESM(require("mongoose"));
var adminSchema = new import_mongoose2.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);
var Admin = import_mongoose2.default.models.Admin || import_mongoose2.default.model("Admin", adminSchema);
var voucherSchema = new import_mongoose2.Schema(
  {
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ["PERCENTAGE", "FIXED"], required: true },
    discountValue: { type: Number, required: true },
    minPurchase: { type: Number, default: 0 },
    maxUsage: { type: Number, required: true },
    usageCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);
var Voucher = import_mongoose2.default.models.Voucher || import_mongoose2.default.model("Voucher", voucherSchema);
var warrantyTicketSchema = new import_mongoose2.Schema(
  {
    refCode: { type: String, required: true, unique: true },
    orderId: { type: import_mongoose2.Schema.Types.ObjectId, ref: "Order", required: true },
    buyerName: { type: String, required: true },
    buyerWa: { type: String, required: true },
    problem: { type: String, required: true },
    status: { type: String, enum: ["OPEN", "PROCESSING", "RESOLVED", "REJECTED"], default: "OPEN" },
    adminResponse: { type: String }
  },
  { timestamps: true }
);
var WarrantyTicket = import_mongoose2.default.models.WarrantyTicket || import_mongoose2.default.model("WarrantyTicket", warrantyTicketSchema);
var activityLogSchema = new import_mongoose2.Schema(
  {
    adminId: { type: import_mongoose2.Schema.Types.ObjectId, ref: "Admin" },
    action: { type: String, required: true },
    details: { type: String },
    ipAddress: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
var ActivityLog = import_mongoose2.default.models.ActivityLog || import_mongoose2.default.model("ActivityLog", activityLogSchema);
var notificationSchema = new import_mongoose2.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["ORDER", "TICKET", "SYSTEM", "ALERT", "PAYMENT", "WARRANTY", "STOCK", "REVIEW"], default: "SYSTEM" },
    isRead: { type: Boolean, default: false },
    link: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
var Notification = import_mongoose2.default.models.Notification || import_mongoose2.default.model("Notification", notificationSchema);

// server/utils/AppError.ts
var AppError = class extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};

// server/config/env.ts
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "production", "test"]).default("development"),
  PORT: import_zod.z.string().default("3000"),
  MONGO_URI: import_zod.z.string().min(1),
  JWT_SECRET: import_zod.z.string().min(1).default("dev-jwt-secret-please-change"),
  JWT_REFRESH_SECRET: import_zod.z.string().min(1).optional(),
  SESSION_SECRET: import_zod.z.string().optional(),
  ENCRYPTION_KEY: import_zod.z.string().optional(),
  MIDTRANS_SERVER_KEY: import_zod.z.string().optional(),
  MIDTRANS_CLIENT_KEY: import_zod.z.string().optional(),
  DIGIFLAZZ_USERNAME: import_zod.z.string().optional(),
  DIGIFLAZZ_API_KEY: import_zod.z.string().optional(),
  FONNTE_TOKEN: import_zod.z.string().optional(),
  REDIS_URL: import_zod.z.string().optional(),
  CLOUDINARY_URL: import_zod.z.string().optional()
});
var _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.error("\u274C Invalid environment variables:\n", JSON.stringify(_env.error.format(), null, 2));
}
var env = _env.success ? _env.data : process.env;

// server/services/auth.service.ts
var AuthService = class {
  hashPassword(password) {
    return import_crypto.default.createHash("sha256").update(password).digest("hex");
  }
  generateTokens(adminId, email) {
    const accessToken = import_jsonwebtoken.default.sign(
      { id: adminId, email, role: "admin" },
      env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = env.JWT_REFRESH_SECRET ? import_jsonwebtoken.default.sign(
      { id: adminId, email },
      env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    ) : void 0;
    return { accessToken, refreshToken };
  }
  async login(email, passwordString) {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new AppError("Kredensial tidak valid", 401);
    }
    const inputHash = this.hashPassword(passwordString);
    if (admin.passwordHash !== inputHash) {
      throw new AppError("Kredensial tidak valid", 401);
    }
    const tokens = this.generateTokens(admin._id.toString(), admin.email);
    return {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      },
      ...tokens
    };
  }
  async getMe(adminId) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new AppError("Admin not found", 404);
    }
    return {
      id: admin._id,
      name: admin.name,
      email: admin.email
    };
  }
};

// server/middlewares/validation.middleware.ts
var import_zod2 = require("zod");
var validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof import_zod2.ZodError) {
        const errorMessages = error.issues.map((issue) => `${issue.path.join(".")} is ${issue.message}`);
        next(new AppError(`Invalid input data: ${errorMessages.join(", ")}`, 400));
      } else {
        next(error);
      }
    }
  };
};

// server/validators/auth.validator.ts
var import_zod3 = require("zod");
var loginSchema = import_zod3.z.object({
  body: import_zod3.z.object({
    email: import_zod3.z.string().email("Invalid email address format"),
    password: import_zod3.z.string().min(6, "Password must be at least 6 characters long")
  })
});

// server/middlewares/auth.middleware.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Unauthorized: No token provided", 401);
    }
    const token = authHeader.split(" ")[1];
    const decoded = import_jsonwebtoken2.default.verify(token, env.JWT_SECRET);
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      next(new AppError("Your token has expired! Please log in again.", 401));
    } else if (error.name === "JsonWebTokenError") {
      next(new AppError("Invalid token. Please log in again!", 401));
    } else {
      next(error);
    }
  }
};

// server/routes/auth.routes.ts
var authService = new AuthService();
var authController = new AuthController(authService);
var router = import_express.default.Router();
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authenticateAdmin, authController.getMe);
var auth_routes_default = router;

// server/routes/category.routes.ts
var import_express2 = __toESM(require("express"));

// server/controllers/category.controller.ts
var CategoryController = class {
  constructor(categoryService2) {
    this.categoryService = categoryService2;
    this.getAll = catchAsync(async (req, res) => {
      const categories = await this.categoryService.getAllCategories();
      res.json(categories);
    });
    this.create = catchAsync(async (req, res) => {
      const category = await this.categoryService.createCategory(req.body);
      res.json({ success: true, category });
    });
    this.update = catchAsync(async (req, res) => {
      const category = await this.categoryService.updateCategory(req.params.id, req.body);
      res.json({ success: true, category });
    });
    this.delete = catchAsync(async (req, res) => {
      await this.categoryService.deleteCategory(req.params.id);
      res.json({ success: true });
    });
    this.reorder = catchAsync(async (req, res) => {
      await this.categoryService.reorderCategories(req.body.orders);
      res.json({ success: true });
    });
  }
};

// server/services/category.service.ts
var CategoryService = class {
  constructor(categoryRepository2) {
    this.categoryRepository = categoryRepository2;
  }
  async getAllCategories() {
    return await this.categoryRepository.findAll();
  }
  async createCategory(data) {
    return await this.categoryRepository.create(data);
  }
  async updateCategory(id, data) {
    return await this.categoryRepository.update(id, data);
  }
  async deleteCategory(id) {
    return await this.categoryRepository.delete(id);
  }
  async reorderCategories(orders) {
    return await this.categoryRepository.reorder(orders);
  }
};

// server/models/Category.ts
var import_mongoose3 = __toESM(require("mongoose"));
var categorySchema = new import_mongoose3.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, default: null },
    type: {
      type: String,
      enum: ["PREMIUM_ACCOUNT", "GAME_TOPUP", "LICENSE"],
      required: true
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);
categorySchema.index({ isActive: 1, sortOrder: 1 });
var Category = import_mongoose3.default.models.Category || import_mongoose3.default.model("Category", categorySchema);
var Category_default = Category;

// server/models/Product.ts
var import_mongoose4 = __toESM(require("mongoose"));
var packageSchema = new import_mongoose4.Schema({
  label: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  durationDays: { type: Number, required: true },
  warrantyDays: { type: Number, required: true },
  maxDevices: { type: Number, default: 1 },
  stockCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});
var productSchema = new import_mongoose4.Schema(
  {
    categoryId: { type: import_mongoose4.Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    totalSold: { type: Number, default: 0 },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: { type: String },
    seoOgImage: { type: String },
    packages: [packageSchema]
  },
  { timestamps: true }
);
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1, isFeatured: -1 });
var Product = import_mongoose4.default.models.Product || import_mongoose4.default.model("Product", productSchema);
var Product_default = Product;

// server/repositories/category.repository.ts
var CategoryRepository = class {
  async findAll() {
    const categories = await Category_default.find().sort({ sortOrder: 1 }).lean();
    const productCounts = await Product_default.aggregate([
      { $group: { _id: "$categoryId", count: { $sum: 1 } } }
    ]);
    const countMap = /* @__PURE__ */ new Map();
    productCounts.forEach((pc) => {
      countMap.set(pc._id?.toString(), pc.count);
    });
    return categories.map((cat) => ({
      ...cat,
      id: cat._id,
      _count: { products: countMap.get(cat._id?.toString()) || 0 }
    }));
  }
  async create(data) {
    return await Category_default.create(data);
  }
  async update(id, data) {
    const category = await Category_default.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!category) throw new AppError("Category not found", 404);
    return category;
  }
  async delete(id) {
    const category = await Category_default.findByIdAndDelete(id);
    if (!category) throw new AppError("Category not found", 404);
    return category;
  }
  async reorder(orders) {
    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { sortOrder: item.sortOrder }
      }
    }));
    await Category_default.bulkWrite(bulkOps);
  }
};

// server/validators/category.validator.ts
var import_zod4 = require("zod");
var createCategorySchema = import_zod4.z.object({
  body: import_zod4.z.object({
    name: import_zod4.z.string().min(1, "Name is required"),
    slug: import_zod4.z.string().min(1, "Slug is required"),
    icon: import_zod4.z.string().optional(),
    sortOrder: import_zod4.z.number().int().optional()
  })
});
var updateCategorySchema = import_zod4.z.object({
  body: import_zod4.z.object({
    name: import_zod4.z.string().min(1, "Name is required").optional(),
    slug: import_zod4.z.string().min(1, "Slug is required").optional(),
    icon: import_zod4.z.string().optional(),
    sortOrder: import_zod4.z.number().int().optional()
  })
});
var reorderCategorySchema = import_zod4.z.object({
  body: import_zod4.z.object({
    orders: import_zod4.z.array(import_zod4.z.object({
      id: import_zod4.z.string(),
      sortOrder: import_zod4.z.number().int()
    })).min(1, "Orders array cannot be empty")
  })
});

// server/middleware/cacheMiddleware.ts
var import_node_cache = __toESM(require("node-cache"));
var cache = new import_node_cache.default({ stdTTL: 300, checkperiod: 320 });
var cacheMiddleware = (durationSeconds) => {
  return (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }
    const key = "__express__" + req.originalUrl || req.url;
    const cachedResponse = cache.get(key);
    if (cachedResponse) {
      res.setHeader("X-Cache", "HIT");
      res.json(cachedResponse);
      return;
    }
    res.setHeader("X-Cache", "MISS");
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body, durationSeconds);
      }
      return originalJson(body);
    };
    next();
  };
};

// server/routes/category.routes.ts
var categoryRepository = new CategoryRepository();
var categoryService = new CategoryService(categoryRepository);
var categoryController = new CategoryController(categoryService);
var publicCategoryRoutes = import_express2.default.Router();
publicCategoryRoutes.get("/", cacheMiddleware(300), categoryController.getAll);
var adminCategoryRoutes = import_express2.default.Router();
adminCategoryRoutes.get("/categories", authenticateAdmin, categoryController.getAll);
adminCategoryRoutes.post("/categories", authenticateAdmin, validate(createCategorySchema), categoryController.create);
adminCategoryRoutes.put("/categories/:id", authenticateAdmin, validate(updateCategorySchema), categoryController.update);
adminCategoryRoutes.delete("/categories/:id", authenticateAdmin, categoryController.delete);
adminCategoryRoutes.put("/categories-reorder", authenticateAdmin, validate(reorderCategorySchema), categoryController.reorder);

// server/routes/product.routes.ts
var import_express3 = __toESM(require("express"));

// server/controllers/product.controller.ts
var ProductController = class {
  constructor(productService2) {
    this.productService = productService2;
    this.getPublicAll = catchAsync(async (req, res) => {
      const categorySlug = req.query.categorySlug;
      const isFeatured = req.query.isFeatured === "true" ? true : void 0;
      const products = await this.productService.getPublicProducts(categorySlug, isFeatured);
      res.json(products);
    });
    this.getPublicDetail = catchAsync(async (req, res) => {
      const product = await this.productService.getPublicProductDetails(req.params.slug);
      res.json(product);
    });
    this.getAdminAll = catchAsync(async (req, res) => {
      const products = await this.productService.getAdminProducts();
      res.json(products);
    });
    this.create = catchAsync(async (req, res) => {
      const product = await this.productService.createProduct(req.body);
      res.json({ success: true, product });
    });
    this.update = catchAsync(async (req, res) => {
      const product = await this.productService.updateProduct(req.params.id, req.body);
      res.json({ success: true, product });
    });
    this.delete = catchAsync(async (req, res) => {
      await this.productService.deleteProduct(req.params.id);
      res.json({ success: true });
    });
    this.addPackage = catchAsync(async (req, res) => {
      const product = await this.productService.addPackage(req.params.productId, req.body);
      res.json({ success: true, product });
    });
    this.updatePackage = catchAsync(async (req, res) => {
      const product = await this.productService.updatePackage(req.params.productId, req.params.packageId, req.body);
      res.json({ success: true, product });
    });
    this.deletePackage = catchAsync(async (req, res) => {
      const product = await this.productService.deletePackage(req.params.productId, req.params.packageId);
      res.json({ success: true, product });
    });
  }
};

// server/services/product.service.ts
var ProductService = class {
  constructor(productRepository2) {
    this.productRepository = productRepository2;
  }
  async getPublicProducts(categorySlug, isFeatured) {
    return await this.productRepository.findPublic(categorySlug, isFeatured);
  }
  async getPublicProductDetails(slug) {
    return await this.productRepository.findPublicBySlug(slug);
  }
  async getAdminProducts() {
    return await this.productRepository.findAllAdmin();
  }
  async createProduct(data) {
    return await this.productRepository.create(data);
  }
  async updateProduct(id, data) {
    return await this.productRepository.update(id, data);
  }
  async deleteProduct(id) {
    return await this.productRepository.delete(id);
  }
  async addPackage(productId, packageData) {
    return await this.productRepository.addPackage(productId, packageData);
  }
  async updatePackage(productId, packageId, packageData) {
    return await this.productRepository.updatePackage(productId, packageId, packageData);
  }
  async deletePackage(productId, packageId) {
    return await this.productRepository.deletePackage(productId, packageId);
  }
};

// server/repositories/product.repository.ts
var ProductRepository = class {
  // Public
  async findPublic(categorySlug, isFeatured) {
    const query = { isActive: true };
    if (isFeatured !== void 0) {
      query.isFeatured = isFeatured;
    }
    if (categorySlug) {
      const category = await Category_default.findOne({ slug: categorySlug });
      if (category) {
        query.categoryId = category._id;
      } else {
        return [];
      }
    }
    const products = await Product_default.find(query).select("name slug thumbnail categoryId totalSold packages isActive isFeatured").populate("categoryId", "name slug icon").sort({ totalSold: -1 }).lean();
    return products.map((product) => ({
      ...product,
      id: product._id.toString(),
      packages: (product.packages || []).filter((p) => p.isActive).sort((a, b) => a.price - b.price).map((p) => ({ ...p, id: p._id?.toString() }))
    }));
  }
  async findPublicBySlug(slug) {
    const product = await Product_default.findOne({ slug, isActive: true }).populate("categoryId", "name slug icon").lean();
    if (!product) throw new AppError("Product not found", 404);
    const packages = (product.packages || []).filter((p) => p.isActive).sort((a, b) => a.price - b.price).map((pkg) => ({
      ...pkg,
      id: pkg._id?.toString(),
      availableStock: 999
      // Unmanaged stock
    }));
    return {
      ...product,
      id: product._id.toString(),
      packages
    };
  }
  // Admin
  async findAllAdmin() {
    const products = await Product_default.find().populate("categoryId").sort({ createdAt: -1 }).lean();
    return products.map((p) => ({
      ...p,
      id: p._id,
      packages: (p.packages || []).map((pkg) => ({ ...pkg, id: pkg._id }))
    }));
  }
  async create(data) {
    return await Product_default.create({ ...data, packages: data.packages || [] });
  }
  async update(id, data) {
    const prod = await Product_default.findByIdAndUpdate(id, data, { new: true });
    if (!prod) throw new AppError("Product not found", 404);
    return prod;
  }
  async delete(id) {
    const prod = await Product_default.findByIdAndDelete(id);
    if (!prod) throw new AppError("Product not found", 404);
    return prod;
  }
  // Packages
  async addPackage(productId, packageData) {
    const prod = await Product_default.findByIdAndUpdate(
      productId,
      { $push: { packages: packageData } },
      { new: true }
    );
    if (!prod) throw new AppError("Product not found", 404);
    return prod;
  }
  async updatePackage(productId, packageId, packageData) {
    const updateQuery = {};
    for (const key in packageData) {
      updateQuery[`packages.$.${key}`] = packageData[key];
    }
    const prod = await Product_default.findOneAndUpdate(
      { _id: productId, "packages._id": packageId },
      { $set: updateQuery },
      { new: true }
    );
    if (!prod) throw new AppError("Product or Package not found", 404);
    return prod;
  }
  async deletePackage(productId, packageId) {
    const prod = await Product_default.findByIdAndUpdate(
      productId,
      { $pull: { packages: { _id: packageId } } },
      { new: true }
    );
    if (!prod) throw new AppError("Product not found", 404);
    return prod;
  }
};

// server/validators/product.validator.ts
var import_zod5 = require("zod");
var packageSchema2 = import_zod5.z.object({
  name: import_zod5.z.string().min(1, "Package name is required"),
  price: import_zod5.z.number().min(0, "Price must be >= 0"),
  originalPrice: import_zod5.z.number().optional(),
  features: import_zod5.z.array(import_zod5.z.string()).optional(),
  isActive: import_zod5.z.boolean().optional(),
  productCode: import_zod5.z.string().optional()
});
var createProductSchema = import_zod5.z.object({
  body: import_zod5.z.object({
    name: import_zod5.z.string().min(1, "Name is required"),
    slug: import_zod5.z.string().min(1, "Slug is required"),
    categoryId: import_zod5.z.string().min(1, "Category ID is required"),
    description: import_zod5.z.string().optional(),
    thumbnail: import_zod5.z.string().optional(),
    images: import_zod5.z.array(import_zod5.z.string()).optional(),
    isActive: import_zod5.z.boolean().optional(),
    isFeatured: import_zod5.z.boolean().optional(),
    isInstant: import_zod5.z.boolean().optional(),
    packages: import_zod5.z.array(packageSchema2).optional()
  })
});
var updateProductSchema = import_zod5.z.object({
  body: import_zod5.z.object({
    name: import_zod5.z.string().min(1).optional(),
    slug: import_zod5.z.string().min(1).optional(),
    categoryId: import_zod5.z.string().min(1).optional(),
    description: import_zod5.z.string().optional(),
    thumbnail: import_zod5.z.string().optional(),
    images: import_zod5.z.array(import_zod5.z.string()).optional(),
    isActive: import_zod5.z.boolean().optional(),
    isFeatured: import_zod5.z.boolean().optional(),
    isInstant: import_zod5.z.boolean().optional(),
    totalSold: import_zod5.z.number().optional()
  })
});
var createPackageSchema = import_zod5.z.object({
  body: packageSchema2
});
var updatePackageSchema = import_zod5.z.object({
  body: packageSchema2.partial()
});

// server/routes/product.routes.ts
var productRepository = new ProductRepository();
var productService = new ProductService(productRepository);
var productController = new ProductController(productService);
var publicProductRoutes = import_express3.default.Router();
publicProductRoutes.get("/", cacheMiddleware(300), productController.getPublicAll);
publicProductRoutes.get("/:slug", cacheMiddleware(300), productController.getPublicDetail);
var adminProductRoutes = import_express3.default.Router();
adminProductRoutes.get("/products", authenticateAdmin, productController.getAdminAll);
adminProductRoutes.post("/products", authenticateAdmin, validate(createProductSchema), productController.create);
adminProductRoutes.put("/products/:id", authenticateAdmin, validate(updateProductSchema), productController.update);
adminProductRoutes.delete("/products/:id", authenticateAdmin, productController.delete);
adminProductRoutes.post("/products/:productId/packages", authenticateAdmin, validate(createPackageSchema), productController.addPackage);
adminProductRoutes.put("/products/:productId/packages/:packageId", authenticateAdmin, validate(updatePackageSchema), productController.updatePackage);
adminProductRoutes.delete("/products/:productId/packages/:packageId", authenticateAdmin, productController.deletePackage);

// server/routes/orderRoutes.ts
var import_express4 = __toESM(require("express"));

// server/models/Order.ts
var import_mongoose5 = __toESM(require("mongoose"));
var orderSchema = new import_mongoose5.Schema(
  {
    refCode: { type: String, required: true, unique: true },
    productId: { type: import_mongoose5.Schema.Types.ObjectId, ref: "Product", required: true },
    packageId: { type: import_mongoose5.Schema.Types.ObjectId, required: true },
    accountStockId: { type: import_mongoose5.Schema.Types.ObjectId, ref: "AccountStock" },
    buyerName: { type: String, required: true },
    buyerWa: { type: String, required: true },
    buyerEmail: { type: String },
    gameUserId: { type: String },
    gameServerId: { type: String },
    notes: { type: String },
    voucherCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    productName: { type: String, required: true },
    packageName: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "SENT", "CANCELLED"],
      default: "PENDING"
    },
    adminNote: { type: String }
  },
  { timestamps: true }
);
orderSchema.index({ buyerWa: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
var Order = import_mongoose5.default.models.Order || import_mongoose5.default.model("Order", orderSchema);
var Order_default = Order;

// server/routes/orderRoutes.ts
var router2 = import_express4.default.Router();
router2.post("/create", async (req, res) => {
  try {
    const { productId, packageId, buyerName, buyerWa, buyerEmail, gameUserId, gameServerId, notes, voucherCode } = req.body;
    if (!productId || !packageId || !buyerName || !buyerWa || !buyerEmail) {
      return res.status(400).json({ error: "Harap isi form pemesanan dengan lengkap (Nama, WA, Email)" });
    }
    const product = await Product_default.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }
    const pkg = product.packages.find((p) => p._id?.toString() === packageId);
    if (!pkg) {
      return res.status(404).json({ error: "Paket tidak ditemukan pada produk ini" });
    }
    const randomHex = Math.random().toString(16).substr(2, 6).toUpperCase();
    const refCode = `PREM-${product.name.slice(0, 3).toUpperCase()}-${randomHex}`;
    let targetPackageLabel = pkg.label;
    if (gameUserId || gameServerId) {
      targetPackageLabel = `${pkg.label} - ID: ${gameUserId || "-"} (${gameServerId || "-"})`;
    }
    const order = await Order_default.create({
      refCode,
      productId: product._id,
      packageId: pkg._id,
      buyerName,
      buyerWa,
      buyerEmail,
      gameUserId,
      gameServerId,
      notes,
      voucherCode,
      productName: product._id.toString() !== "dummy" ? product.name : product.name,
      // Just keeping variable name
      packageName: targetPackageLabel,
      price: pkg.price,
      // Harga tanpa voucher (bisa ditambahkan logika voucher seperti sebelumnya)
      status: "PENDING",
      adminNote: "Menunggu pembayaran via Payment Gateway. Ref code : " + refCode
    });
    res.json({
      success: true,
      order,
      refCode,
      message: "Order berhasil dibuat dan masuk ke database MongoDB"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var orderRoutes_default = router2;

// server/routes/adminRoutes.ts
var import_express5 = __toESM(require("express"));

// server/models/Marketing.ts
var import_mongoose6 = __toESM(require("mongoose"));
var flashSaleItemSchema = new import_mongoose6.Schema(
  {
    productId: { type: import_mongoose6.Schema.Types.ObjectId, ref: "Product", required: true },
    packageId: { type: import_mongoose6.Schema.Types.ObjectId, required: true },
    salePrice: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  }
);
var FlashSaleItem = import_mongoose6.default.models.FlashSaleItem || import_mongoose6.default.model("FlashSaleItem", flashSaleItemSchema);
var bannerSchema = new import_mongoose6.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    link: { type: String },
    position: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);
var Banner = import_mongoose6.default.models.Banner || import_mongoose6.default.model("Banner", bannerSchema);
var supportTicketSchema = new import_mongoose6.Schema(
  {
    refCode: { type: String, required: true, unique: true },
    buyerName: { type: String, required: true },
    buyerWa: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["OPEN", "REPLIED", "CLOSED"], default: "OPEN" },
    adminReply: { type: String }
  },
  { timestamps: true }
);
var SupportTicket = import_mongoose6.default.models.SupportTicket || import_mongoose6.default.model("SupportTicket", supportTicketSchema);

// server/routes/adminRoutes.ts
init_Settings();

// server/models/Review.ts
var import_mongoose8 = __toESM(require("mongoose"));
var reviewSchema = new import_mongoose8.Schema(
  {
    productId: { type: import_mongoose8.Schema.Types.ObjectId, ref: "Product", required: true },
    buyerName: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    isApproved: { type: Boolean, default: false }
  },
  { timestamps: true }
);
reviewSchema.index({ productId: 1, isApproved: 1, createdAt: -1 });
var Review = import_mongoose8.default.models.Review || import_mongoose8.default.model("Review", reviewSchema);
var testimonialSchema = new import_mongoose8.Schema(
  {
    buyerName: { type: String, required: true },
    avatarUrl: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    productName: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);
testimonialSchema.index({ isActive: 1, sortOrder: 1 });
var Testimonial = import_mongoose8.default.models.Testimonial || import_mongoose8.default.model("Testimonial", testimonialSchema);

// server/models/AccountStock.ts
var import_mongoose9 = __toESM(require("mongoose"));
var accountStockSchema = new import_mongoose9.Schema(
  {
    packageId: { type: import_mongoose9.Schema.Types.ObjectId, required: true },
    emailAkun: { type: String, required: true },
    passwordAkun: { type: String, required: true },
    infoTambahan: { type: String },
    status: {
      type: String,
      enum: ["AVAILABLE", "SOLD", "REPLACED"],
      default: "AVAILABLE"
    },
    soldAt: { type: Date }
  },
  { timestamps: true }
);
accountStockSchema.index({ packageId: 1, status: 1 });
var AccountStock = import_mongoose9.default.models.AccountStock || import_mongoose9.default.model("AccountStock", accountStockSchema);
var AccountStock_default = AccountStock;

// server/models/Customer.ts
var import_mongoose10 = __toESM(require("mongoose"));
var customerOrderSchema = new import_mongoose10.Schema({
  orderId: { type: import_mongoose10.Schema.Types.ObjectId, ref: "Order", required: true },
  refCode: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});
var customerSchema = new import_mongoose10.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: { type: Date, default: Date.now },
  orderHistory: [customerOrderSchema]
}, { timestamps: true });
var Customer = import_mongoose10.default.model("Customer", customerSchema);
var Customer_default = Customer;

// server/services/customerService.ts
var trackCustomerOrder = async (buyerName, buyerWa, buyerEmail, orderId, refCode, amount) => {
  try {
    let customer = await Customer_default.findOne({ phone: buyerWa });
    if (!customer) {
      customer = new Customer_default({
        name: buyerName,
        phone: buyerWa,
        email: buyerEmail,
        totalOrders: 1,
        totalSpent: 0,
        // Not accumulated yet
        lastOrderDate: /* @__PURE__ */ new Date(),
        orderHistory: [{ orderId, refCode, amount, date: /* @__PURE__ */ new Date() }]
      });
    } else {
      customer.name = buyerName;
      if (buyerEmail) customer.email = buyerEmail;
      customer.totalOrders += 1;
      customer.lastOrderDate = /* @__PURE__ */ new Date();
      customer.orderHistory.push({ orderId, refCode, amount, date: /* @__PURE__ */ new Date() });
    }
    await customer.save();
  } catch (error) {
    console.error("Error tracking customer:", error);
  }
};
var accumulateCustomerSpent = async (buyerWa, amount) => {
  try {
    await Customer_default.updateOne(
      { phone: buyerWa },
      { $inc: { totalSpent: amount } }
    );
  } catch (error) {
    console.error("Error accumulating customer spent:", error);
  }
};

// server/routes/adminRoutes.ts
var router3 = import_express5.default.Router();
router3.get("/stats", authenticateAdmin, async (req, res) => {
  try {
    const totalOrders = await Order_default.countDocuments();
    const pendingOrders = await Order_default.countDocuments({ status: "PENDING" });
    const confirmedOrders = await Order_default.countDocuments({ status: "CONFIRMED" });
    const sentOrders = await Order_default.countDocuments({ status: "SENT" });
    const completedOrders = await Order_default.find({ status: { $in: ["CONFIRMED", "SENT"] } }).select("price");
    const totalEarning = completedOrders.reduce((sum, ord) => sum + ord.price, 0);
    const productsCount = await Product_default.countDocuments({ isActive: true });
    const recentOrders = await Order_default.find().sort({ createdAt: -1 }).limit(10);
    res.json({ totalOrders, pendingOrders, confirmedOrders, sentOrders, totalEarning, productsCount, recentOrders, lowStockWarnings: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/stocks", authenticateAdmin, async (req, res) => {
  try {
    const stocks = await AccountStock_default.find().sort({ createdAt: -1 }).lean();
    const enriched = await Promise.all(stocks.map(async (st) => {
      const product = await Product_default.findOne({ "packages._id": st.packageId }).lean();
      const pkg = product?.packages.find((p) => p._id?.toString() === st.packageId?.toString());
      return {
        id: st._id,
        username: st.emailAkun,
        password: st.passwordAkun,
        isSold: st.status !== "AVAILABLE",
        package: pkg ? { ...pkg, product } : null
      };
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/packages/:packageId/stocks", authenticateAdmin, async (req, res) => {
  try {
    const stocks = await AccountStock_default.find({ packageId: req.params.packageId }).lean();
    res.json(stocks.map((s) => ({ id: s._id, ...s })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.post("/stocks", authenticateAdmin, async (req, res) => {
  try {
    const { packageId, usernames, password } = req.body;
    const docs = usernames.filter((u) => u).map((u) => ({ packageId, emailAkun: u, passwordAkun: password, status: "AVAILABLE" }));
    await AccountStock_default.insertMany(docs);
    const product = await Product_default.findOne({ "packages._id": packageId });
    if (product) {
      const pkg = product.packages.find((p) => p._id?.toString() === packageId.toString());
      if (pkg) {
        pkg.stockCount = (pkg.stockCount || 0) + docs.length;
        await product.save();
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.delete("/stocks/:id", authenticateAdmin, async (req, res) => {
  try {
    const stock = await AccountStock_default.findById(req.params.id);
    if (stock && stock.status === "AVAILABLE") {
      const product = await Product_default.findOne({ "packages._id": stock.packageId });
      if (product) {
        const pkg = product.packages.find((p) => p._id?.toString() === stock.packageId.toString());
        if (pkg) {
          pkg.stockCount = Math.max(0, (pkg.stockCount || 0) - 1);
          await product.save();
        }
      }
    }
    await AccountStock_default.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/orders/:id/copy-template", authenticateAdmin, async (req, res) => {
  try {
    const order = await Order_default.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    const template = await WaTemplate.findOne({ key: "order_confirmed", isActive: true });
    let templateText = template?.templateText || `Halo Kak {buyerName}, pesanan Anda sudah DIKONFIRMASI!

\u{1F4E6} Produk: {productName}
\u{1F4CB} Paket: {packageName}
\u{1F4B0} Harga: {price}
\u{1F511} Ref: {refCode}

Terima kasih sudah berbelanja di PILONEKO! \u{1F389}`;
    templateText = templateText.replace(/{buyerName}/g, order.buyerName).replace(/{productName}/g, order.productName).replace(/{packageName}/g, order.packageName).replace(/{price}/g, `Rp ${order.price.toLocaleString("id-ID")}`).replace(/{refCode}/g, order.refCode);
    res.json({ templateText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/orders", authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order_default.find().sort({ createdAt: -1 }).lean();
    res.json(orders.map((o) => ({ id: o._id, ...o })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.put("/orders/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const oldOrder = await Order_default.findById(req.params.id);
    const order = await Order_default.findByIdAndUpdate(req.params.id, { status: req.body.status, adminNote: req.body.adminNote }, { new: true });
    if (oldOrder && order) {
      const isSuccessState = ["SENT", "COMPLETED", "CONFIRMED"].includes(order.status);
      const wasSuccessState = ["SENT", "COMPLETED", "CONFIRMED"].includes(oldOrder.status);
      if (isSuccessState && !wasSuccessState) {
        await accumulateCustomerSpent(order.buyerWa, order.price);
      } else if (!isSuccessState && wasSuccessState) {
        await accumulateCustomerSpent(order.buyerWa, -order.price);
      }
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.delete("/orders/:id", authenticateAdmin, async (req, res) => {
  try {
    await Order_default.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/banners", authenticateAdmin, async (req, res) => {
  try {
    const banners = await Banner.find().sort({ position: 1 }).lean();
    res.json(banners.map((b) => ({ id: b._id, ...b })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.post("/banners", authenticateAdmin, async (req, res) => {
  try {
    const b = await Banner.create(req.body);
    res.json({ success: true, banner: b });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.put("/banners/:id", authenticateAdmin, async (req, res) => {
  try {
    const b = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, banner: b });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.delete("/banners/:id", authenticateAdmin, async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/flash-sales", authenticateAdmin, async (req, res) => {
  try {
    const items = await FlashSaleItem.find().lean();
    const enriched = await Promise.all(items.map(async (item) => {
      const product = await Product_default.findById(item.productId).lean();
      const pkg = product?.packages.find((p) => p._id?.toString() === item.packageId?.toString());
      return { id: item._id, ...item, product, package: pkg };
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.post("/flash-sales", authenticateAdmin, async (req, res) => {
  try {
    const { productId, packageId, salePrice } = req.body;
    const item = await FlashSaleItem.create({ productId, packageId, salePrice });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.delete("/flash-sales/:id", authenticateAdmin, async (req, res) => {
  try {
    await FlashSaleItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/vouchers", authenticateAdmin, async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 }).lean();
    res.json(vouchers.map((v) => ({ id: v._id, ...v })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.post("/vouchers", authenticateAdmin, async (req, res) => {
  try {
    const v = await Voucher.create(req.body);
    res.json({ success: true, voucher: v });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.put("/vouchers/:id", authenticateAdmin, async (req, res) => {
  try {
    const v = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, voucher: v });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.delete("/vouchers/:id", authenticateAdmin, async (req, res) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/faqs", authenticateAdmin, async (req, res) => {
  try {
    const faqs = await FaqItem.find().sort({ sortOrder: 1 }).lean();
    res.json(faqs.map((f) => ({ id: f._id, ...f })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.post("/faqs", authenticateAdmin, async (req, res) => {
  try {
    const f = await FaqItem.create(req.body);
    res.json({ success: true, faq: f });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.put("/faqs/:id", authenticateAdmin, async (req, res) => {
  try {
    const f = await FaqItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, faq: f });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.delete("/faqs/:id", authenticateAdmin, async (req, res) => {
  try {
    await FaqItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/testimonials", authenticateAdmin, async (req, res) => {
  try {
    const t = await Testimonial.find().sort({ createdAt: -1 }).lean();
    res.json(t.map((x) => ({ id: x._id, ...x })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.post("/testimonials", authenticateAdmin, async (req, res) => {
  try {
    const t = await Testimonial.create(req.body);
    res.json({ success: true, testimonial: t });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.put("/testimonials/:id", authenticateAdmin, async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, testimonial: t });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.delete("/testimonials/:id", authenticateAdmin, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/warranty", authenticateAdmin, async (req, res) => {
  try {
    const w = await WarrantyTicket.find().sort({ createdAt: -1 }).lean();
    res.json(w.map((x) => ({ id: x._id, ...x })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.put("/warranty/:id", authenticateAdmin, async (req, res) => {
  try {
    const w = await WarrantyTicket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, ticket: w });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/support", authenticateAdmin, async (req, res) => {
  try {
    const s = await SupportTicket.find().sort({ createdAt: -1 }).lean();
    res.json(s.map((x) => ({ id: x._id, ...x })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.put("/support/:id", authenticateAdmin, async (req, res) => {
  try {
    const s = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, ticket: s });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/site-content", authenticateAdmin, async (req, res) => {
  try {
    const c = await SiteContent.find().lean();
    res.json(c.map((x) => ({ id: x._id, ...x })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.put("/site-content/batch", authenticateAdmin, async (req, res) => {
  try {
    const updates = Array.isArray(req.body) ? req.body : req.body.updates || [];
    for (const update of updates) {
      await SiteContent.updateOne(
        { key: update.key },
        { $set: { value: update.value, type: update.type || "TEXT" } },
        { upsert: true }
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/reviews", authenticateAdmin, async (req, res) => {
  try {
    const r = await Review.find().sort({ createdAt: -1 }).lean();
    res.json(r.map((x) => ({ id: x._id, ...x })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/reviews/pending", authenticateAdmin, async (req, res) => {
  try {
    const r = await Review.find({ isApproved: false }).sort({ createdAt: -1 }).lean();
    res.json(r.map((x) => ({ id: x._id, ...x })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.put("/reviews/:id/approve", authenticateAdmin, async (req, res) => {
  try {
    const r = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json({ success: true, review: r });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.delete("/reviews/:id", authenticateAdmin, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/analytics", authenticateAdmin, async (req, res) => {
  try {
    const totalOrders = await Order_default.countDocuments();
    const pendingOrders = await Order_default.countDocuments({ status: "PENDING" });
    const successOrders = await Order_default.countDocuments({ status: { $in: ["CONFIRMED", "SENT"] } });
    const completedOrders = await Order_default.find({ status: { $in: ["CONFIRMED", "SENT"] } }).select("price productId productName createdAt");
    const totalEarning = completedOrders.reduce((sum, o) => sum + o.price, 0);
    const dailySalesMap = {};
    const thirtyDaysAgo = /* @__PURE__ */ new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    for (let i = 29; i >= 0; i--) {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dailySalesMap[dateStr] = { count: 0, earnings: 0 };
    }
    const productStats = {};
    completedOrders.forEach((o) => {
      if (o.createdAt >= thirtyDaysAgo) {
        const dateStr = new Date(o.createdAt).toISOString().split("T")[0];
        if (dailySalesMap[dateStr]) {
          dailySalesMap[dateStr].count += 1;
          dailySalesMap[dateStr].earnings += o.price;
        }
      }
      const pId = o.productId?.toString();
      if (pId) {
        if (!productStats[pId]) {
          productStats[pId] = { id: pId, name: o.productName, totalSold: 0, earnings: 0 };
        }
        productStats[pId].totalSold += 1;
        productStats[pId].earnings += o.price;
      }
    });
    const dailySales = Object.keys(dailySalesMap).sort().map((date) => ({
      date,
      count: dailySalesMap[date].count,
      earnings: dailySalesMap[date].earnings
    }));
    const productIds = Object.keys(productStats);
    const products = await Product_default.find({ _id: { $in: productIds } });
    const categoryStats = {};
    const categories = await Category_default.find();
    const catMap = /* @__PURE__ */ new Map();
    categories.forEach((c) => catMap.set(c._id.toString(), c));
    products.forEach((p) => {
      const pId = p._id.toString();
      if (productStats[pId]) {
        productStats[pId].thumbnail = p.thumbnail;
      }
      const catId = p.categoryId?.toString();
      if (catId && catMap.has(catId) && productStats[pId]) {
        if (!categoryStats[catId]) {
          const cat = catMap.get(catId);
          categoryStats[catId] = { id: catId, name: cat.name, type: cat.type, totalSold: 0, earnings: 0 };
        }
        categoryStats[catId].totalSold += productStats[pId].totalSold;
        categoryStats[catId].earnings += productStats[pId].earnings;
      }
    });
    const topProductsBySold = Object.values(productStats).sort((a, b) => b.totalSold - a.totalSold).slice(0, 10);
    const topProductsByEarnings = Object.values(productStats).sort((a, b) => b.earnings - a.earnings).slice(0, 10);
    const topCategories = Object.values(categoryStats).sort((a, b) => b.earnings - a.earnings);
    res.json({
      totalOrders,
      totalEarning,
      pendingOrders,
      successOrders,
      dailySales,
      topProductsBySold,
      topProductsByEarnings,
      topCategories
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/wa-templates", authenticateAdmin, async (req, res) => {
  try {
    const w = await WaTemplate.find().lean();
    res.json(w.map((x) => ({ id: x._id, ...x })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.put("/wa-templates/batch", authenticateAdmin, async (req, res) => {
  try {
    const { templates } = req.body;
    for (const t of templates) {
      await WaTemplate.findByIdAndUpdate(t.id, { templateText: t.templateText });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.put("/wa-templates/:id", authenticateAdmin, async (req, res) => {
  try {
    const w = await WaTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, template: w });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/activity-logs", authenticateAdmin, async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json({ logs: logs.map((x) => ({ id: x._id, ...x })), total: logs.length, totalPages: 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/notifications", authenticateAdmin, async (req, res) => {
  try {
    const n = await Notification.find().sort({ createdAt: -1 }).limit(20).lean();
    res.json(n.map((x) => ({ id: x._id, ...x })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.put("/notifications/read-all", authenticateAdmin, async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var adminRoutes_default = router3;

// server/routes/publicRoutes.ts
var import_express6 = __toESM(require("express"));
init_Settings();
var router4 = import_express6.default.Router();
router4.get("/site-content", async (req, res) => {
  try {
    const items = await SiteContent.find().lean();
    res.json(items.map((i) => ({ id: i._id, key: i.key, value: i.value, type: i.type })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router4.get("/faqs", async (req, res) => {
  try {
    const faqs = await FaqItem.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    res.json(faqs.map((f) => ({ id: f._id, ...f })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router4.get("/testimonials", async (req, res) => {
  try {
    const testi = await Testimonial.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.json(testi.map((t) => ({ id: t._id, ...t })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router4.get("/flash-sales", async (req, res) => {
  try {
    const items = await FlashSaleItem.find({ isActive: true }).lean();
    const enriched = await Promise.all(items.map(async (item) => {
      const product = await Product_default.findById(item.productId).lean();
      const pkg = product?.packages.find((p) => p._id?.toString() === item.packageId?.toString());
      return { id: item._id, ...item, product, package: pkg };
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router4.post("/checkout", async (req, res) => {
  res.status(301).json({ message: "Use /api/orders/create" });
});
router4.get("/banners", async (req, res) => {
  try {
    const now = /* @__PURE__ */ new Date();
    const banners = await Banner.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ position: 1 }).lean();
    res.json(banners.map((b) => ({ id: b._id, ...b })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router4.post("/warranty", async (req, res) => {
  try {
    const { orderRefCode, buyerName, buyerWa, problem } = req.body;
    if (!orderRefCode || !buyerName || !buyerWa || !problem) {
      return res.status(400).json({ error: "Data klaim tidak lengkap" });
    }
    const order = await Order_default.findOne({ refCode: orderRefCode });
    if (!order) return res.status(404).json({ error: "Order tidak ditemukan dengan kode tersebut" });
    const refCode = `W-${Date.now()}`;
    const ticket = await WarrantyTicket.create({
      refCode,
      orderId: order._id,
      buyerName,
      buyerWa,
      problem,
      status: "OPEN"
    });
    await Notification.create({
      title: `\u26A0\uFE0F Klaim Garansi Baru: ${refCode}`,
      message: `Terdapat klaim garansi baru untuk order ${orderRefCode}.`,
      type: "WARRANTY",
      isRead: false
    });
    res.json({ success: true, refCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router4.post("/support", async (req, res) => {
  try {
    const { buyerName, buyerWa, subject, message } = req.body;
    if (!buyerName || !buyerWa || !subject || !message) {
      return res.status(400).json({ error: "Data tiket tidak lengkap" });
    }
    const refCode = `S-${Date.now()}`;
    const ticket = await SupportTicket.create({
      refCode,
      buyerName,
      buyerWa,
      subject,
      message,
      status: "OPEN"
    });
    await Notification.create({
      title: `\u{1F4AC} Tiket Bantuan Baru: ${refCode}`,
      message: `Pesan baru dari ${buyerName} - Subjek: ${subject}`,
      type: "TICKET",
      isRead: false
    });
    res.json({ success: true, refCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var publicRoutes_default = router4;

// server/routes/paymentRoutes.ts
var import_express8 = __toESM(require("express"));
var import_midtrans_client2 = __toESM(require("midtrans-client"));

// server/models/Payment.ts
var import_mongoose11 = __toESM(require("mongoose"));
var paymentSchema = new import_mongoose11.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    buyerWa: { type: String, required: true },
    amount: { type: Number, required: true },
    productName: { type: String, required: true },
    paymentMethod: { type: String, default: "midtrans" },
    transactionStatus: {
      type: String,
      enum: ["pending", "settlement", "capture", "expire", "cancel", "deny", "refund"],
      default: "pending"
    },
    transactionTime: { type: Date, default: Date.now },
    snapToken: { type: String },
    snapRedirectUrl: { type: String }
  },
  { timestamps: true }
);
var Payment = import_mongoose11.default.models.Payment || import_mongoose11.default.model("Payment", paymentSchema);

// server/models/TopupOrder.ts
var import_mongoose12 = __toESM(require("mongoose"));
var topupOrderSchema = new import_mongoose12.default.Schema({
  invoice: { type: String, required: true, unique: true },
  customerId: { type: import_mongoose12.default.Schema.Types.ObjectId, ref: "Customer" },
  // Optional reference
  customerName: { type: String, required: true },
  customerWa: { type: String, required: true },
  customerEmail: { type: String },
  gameId: { type: import_mongoose12.default.Schema.Types.ObjectId, ref: "Game", required: true },
  productId: { type: import_mongoose12.default.Schema.Types.ObjectId, ref: "GameProduct", required: true },
  accountData: { type: import_mongoose12.default.Schema.Types.Mixed, required: true },
  // Store dynamic fields JSON
  paymentMethod: { type: String, required: true },
  // e.g., 'MIDTRANS'
  amount: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "PAID", "PROCESSING", "SUCCESS", "FAILED"], default: "PENDING" },
  digiflazzResponse: { type: import_mongoose12.default.Schema.Types.Mixed }
  // Store API response
}, { timestamps: true });
topupOrderSchema.index({ customerWa: 1 });
topupOrderSchema.index({ status: 1, createdAt: -1 });
var TopupOrder = import_mongoose12.default.models.TopupOrder || import_mongoose12.default.model("TopupOrder", topupOrderSchema);
var TopupOrder_default = TopupOrder;

// server/routes/paymentRoutes.ts
var import_crypto4 = __toESM(require("crypto"));

// server/models/WebhookLog.ts
var import_mongoose13 = __toESM(require("mongoose"));
var webhookLogSchema = new import_mongoose13.Schema(
  {
    orderId: { type: String, required: true, index: true },
    transactionStatus: { type: String, required: true },
    paymentType: { type: String, default: "unknown" },
    grossAmount: { type: String, default: "0" },
    signatureValid: { type: Boolean, default: false },
    rawPayload: { type: String, required: true },
    processedAt: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
webhookLogSchema.index({ createdAt: -1 });
webhookLogSchema.index({ transactionStatus: 1 });
var WebhookLog = import_mongoose13.default.models.WebhookLog || import_mongoose13.default.model("WebhookLog", webhookLogSchema);

// server/routes/paymentSettingsRoutes.ts
var import_express7 = __toESM(require("express"));
var import_crypto_js = __toESM(require("crypto-js"));
var import_midtrans_client = __toESM(require("midtrans-client"));

// server/models/PaymentSetting.ts
var import_mongoose14 = __toESM(require("mongoose"));
var paymentSettingSchema = new import_mongoose14.Schema(
  {
    serverKey: { type: String, required: true },
    clientKey: { type: String, required: true },
    merchantId: { type: String },
    isProduction: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    connectionStatus: {
      type: String,
      enum: ["connected", "disconnected", "invalid_key", "untested"],
      default: "untested"
    },
    lastConnectedAt: { type: Date }
  },
  { timestamps: true }
);
var PaymentSetting = import_mongoose14.default.models.PaymentSetting || import_mongoose14.default.model("PaymentSetting", paymentSettingSchema);

// server/models/ActivityLog.ts
var import_mongoose15 = __toESM(require("mongoose"));
var activityLogSchema2 = new import_mongoose15.Schema(
  {
    adminId: { type: String, default: "SYSTEM" },
    action: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: String },
    description: { type: String, required: true }
  },
  { timestamps: true }
);
activityLogSchema2.index({ createdAt: -1 });
var ActivityLog2 = import_mongoose15.default.models.ActivityLog || import_mongoose15.default.model("ActivityLog", activityLogSchema2);
var notificationSchema2 = new import_mongoose15.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);
notificationSchema2.index({ isRead: 1, createdAt: -1 });
var Notification2 = import_mongoose15.default.models.Notification || import_mongoose15.default.model("Notification", notificationSchema2);

// server/routes/paymentSettingsRoutes.ts
var router5 = import_express7.default.Router();
var ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "piloneko-secure-key-32chars-!!!!";
var encryptKey = (text) => {
  return import_crypto_js.default.AES.encrypt(text, ENCRYPTION_KEY).toString();
};
var decryptKey = (ciphertext) => {
  const bytes = import_crypto_js.default.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(import_crypto_js.default.enc.Utf8);
};
router5.get("/", authenticateAdmin, async (req, res) => {
  try {
    const setting = await PaymentSetting.findOne().lean();
    if (!setting) {
      return res.json({ exists: false });
    }
    const masked = {
      ...setting,
      exists: true,
      serverKey: "***" + (decryptKey(setting.serverKey).slice(-6) || ""),
      clientKey: setting.clientKey
    };
    res.json(masked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router5.put("/", authenticateAdmin, async (req, res) => {
  try {
    const { serverKey, clientKey, merchantId, isProduction, isActive } = req.body;
    if (!serverKey || !clientKey) {
      return res.status(400).json({ error: "Server Key dan Client Key wajib diisi" });
    }
    let encryptedServerKey;
    const existing = await PaymentSetting.findOne();
    if (serverKey.startsWith("***") && existing) {
      encryptedServerKey = existing.serverKey;
    } else {
      encryptedServerKey = encryptKey(serverKey);
    }
    const data = {
      serverKey: encryptedServerKey,
      clientKey,
      merchantId: merchantId || "",
      isProduction: !!isProduction,
      isActive: isActive !== false,
      connectionStatus: "untested"
    };
    let result;
    if (existing) {
      result = await PaymentSetting.findByIdAndUpdate(existing._id, data, { new: true });
    } else {
      result = await PaymentSetting.create(data);
    }
    try {
      await ActivityLog2.create({
        action: "UPDATE_PAYMENT_SETTINGS",
        entityType: "PaymentSetting",
        entityId: result?._id?.toString(),
        adminId: req.admin?._id?.toString() || "SYSTEM",
        description: `Mode: ${isProduction ? "Production" : "Sandbox"}, Active: ${isActive}`
      });
    } catch {
    }
    res.json({ success: true, message: "Pengaturan Midtrans berhasil disimpan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router5.post("/test", authenticateAdmin, async (_req, res) => {
  try {
    const setting = await PaymentSetting.findOne();
    if (!setting) {
      return res.status(404).json({ error: "Belum ada konfigurasi Midtrans. Simpan dulu." });
    }
    const serverKey = decryptKey(setting.serverKey);
    const isProduction = setting.isProduction;
    const snap = new import_midtrans_client.default.Snap({
      isProduction,
      serverKey,
      clientKey: setting.clientKey
    });
    try {
      await snap.createTransaction({
        transaction_details: {
          order_id: `TEST-${Date.now()}`,
          gross_amount: 1
        }
      });
      setting.connectionStatus = "connected";
      setting.lastConnectedAt = /* @__PURE__ */ new Date();
      await setting.save();
      return res.json({
        success: true,
        status: "connected",
        message: "Koneksi Midtrans berhasil! Kredensial valid.",
        mode: isProduction ? "Production" : "Sandbox",
        lastConnectedAt: setting.lastConnectedAt
      });
    } catch (snapError) {
      const message = snapError?.message || "";
      let status = "disconnected";
      let userMessage = "Gagal terhubung ke Midtrans. Cek koneksi internet.";
      if (message.includes("401") || message.includes("Unauthorized") || message.includes("Access denied") || message.includes("invalid")) {
        status = "invalid_key";
        userMessage = "Server Key atau Client Key tidak valid. Periksa kembali.";
      }
      setting.connectionStatus = status;
      await setting.save();
      return res.json({
        success: false,
        status,
        message: userMessage,
        rawError: message
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router5.get("/status", authenticateAdmin, async (_req, res) => {
  try {
    const setting = await PaymentSetting.findOne().lean();
    if (!setting) {
      return res.json({ exists: false, status: "disconnected" });
    }
    res.json({
      exists: true,
      status: setting.connectionStatus,
      isProduction: setting.isProduction,
      isActive: setting.isActive,
      lastConnectedAt: setting.lastConnectedAt,
      clientKey: setting.clientKey
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var getMidtransConfig = async () => {
  try {
    const setting = await PaymentSetting.findOne();
    if (setting) {
      if (!setting.isActive) {
        return { serverKey: "", clientKey: "", isProduction: false, fromDb: true };
      }
      return {
        serverKey: decryptKey(setting.serverKey),
        clientKey: setting.clientKey,
        isProduction: setting.isProduction,
        fromDb: true
      };
    }
  } catch {
  }
  return {
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    fromDb: false
  };
};
var paymentSettingsRoutes_default = router5;

// server/models/DigiflazzSetting.ts
var import_mongoose16 = __toESM(require("mongoose"));
var digiflazzSettingSchema = new import_mongoose16.default.Schema({
  username: { type: String, default: "" },
  apiKey: { type: String, default: "" },
  webhookSecret: { type: String, default: "" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
var DigiflazzSetting = import_mongoose16.default.models.DigiflazzSetting || import_mongoose16.default.model("DigiflazzSetting", digiflazzSettingSchema);
var DigiflazzSetting_default = DigiflazzSetting;

// server/routes/paymentRoutes.ts
var import_express_rate_limit = __toESM(require("express-rate-limit"));

// server/validators/apiValidators.ts
var import_zod6 = require("zod");

// server/utils/responseHelper.ts
var sendError = (res, message = "Error", statusCode = 500, error = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error
  });
};

// server/validators/apiValidators.ts
var validate2 = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof import_zod6.z.ZodError) {
        return sendError(res, "Validasi gagal", 400, error.errors);
      }
      return sendError(res, "Terjadi kesalahan", 500, error);
    }
  };
};
var loginSchema2 = import_zod6.z.object({
  email: import_zod6.z.string().email({ message: "Format email tidak valid" }),
  password: import_zod6.z.string().min(6, { message: "Password minimal 6 karakter" })
});
var checkoutSchema = import_zod6.z.object({
  productId: import_zod6.z.string().min(1, "ID Produk wajib diisi"),
  packageId: import_zod6.z.string().min(1, "ID Paket wajib diisi"),
  buyerName: import_zod6.z.string().min(2, "Nama pembeli minimal 2 karakter"),
  buyerWa: import_zod6.z.string().min(9, "Nomor WhatsApp tidak valid"),
  buyerEmail: import_zod6.z.string().email("Email tidak valid").optional().or(import_zod6.z.literal("")),
  gameUserId: import_zod6.z.string().optional(),
  gameServerId: import_zod6.z.string().optional(),
  notes: import_zod6.z.string().optional(),
  voucherCode: import_zod6.z.string().optional()
});

// server/routes/paymentRoutes.ts
init_whatsappService();

// server/services/digiflazzService.ts
var import_crypto3 = __toESM(require("crypto"));
var import_undici = require("undici");
var DIGIFLAZZ_BASE_URL = "https://api.digiflazz.com/v1";
var getFetchOptions = (payload) => {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  };
  if (process.env.FIXIE_URL) {
    options.dispatcher = new import_undici.ProxyAgent(process.env.FIXIE_URL);
  }
  return options;
};
var DigiflazzService = class {
  static async getSettings() {
    let settings = await DigiflazzSetting_default.findOne();
    if (!settings) {
      settings = await DigiflazzSetting_default.create({});
    }
    return settings;
  }
  static generateSign(username, apiKey, refId) {
    const rawString = username + apiKey + refId;
    return import_crypto3.default.createHash("md5").update(rawString).digest("hex");
  }
  static async getPrepaidProducts() {
    const settings = await this.getSettings();
    if (!settings.username || !settings.apiKey) {
      throw new Error("Digiflazz credentials not configured");
    }
    const sign = this.generateSign(settings.username, settings.apiKey, "depo");
    const payload = {
      cmd: "prepaid",
      username: settings.username,
      sign
    };
    const response = await fetch(`${DIGIFLAZZ_BASE_URL}/price-list`, getFetchOptions(payload));
    const data = await response.json();
    if (!response.ok || !data.data) {
      throw new Error(data.message || "Failed to fetch price list from Digiflazz");
    }
    if (!Array.isArray(data.data)) {
      throw new Error(data.data.message || JSON.stringify(data.data));
    }
    return data.data;
  }
  static async createTransaction(sku, customerNo, refId) {
    const settings = await this.getSettings();
    if (!settings.username || !settings.apiKey) {
      throw new Error("Digiflazz credentials not configured");
    }
    const sign = this.generateSign(settings.username, settings.apiKey, refId);
    const payload = {
      username: settings.username,
      buyer_sku_code: sku,
      customer_no: customerNo,
      ref_id: refId,
      sign,
      cb_url: ""
    };
    const response = await fetch(`${DIGIFLAZZ_BASE_URL}/transaction`, getFetchOptions(payload));
    const data = await response.json();
    if (!response.ok) {
      if (data && data.data) return data.data;
      throw new Error(data.message || "Failed to create transaction");
    }
    return data.data;
  }
  static async checkBalance() {
    const settings = await this.getSettings();
    if (!settings.username || !settings.apiKey) {
      throw new Error("Digiflazz credentials not configured");
    }
    const sign = this.generateSign(settings.username, settings.apiKey, "depo");
    const payload = {
      cmd: "deposit",
      username: settings.username,
      sign
    };
    const response = await fetch(`${DIGIFLAZZ_BASE_URL}/cek-saldo`, getFetchOptions(payload));
    const data = await response.json();
    return data.data;
  }
};

// server/services/paymentLogicService.ts
var processMidtransStatus = async (orderId, transactionStatus, fraudStatus) => {
  const isTopup = orderId.startsWith("TP-");
  if (isTopup) {
    return processTopupMidtransStatus(orderId, transactionStatus, fraudStatus);
  }
  const payment = await Payment.findOne({ orderId });
  const order = await Order_default.findOne({ refCode: orderId });
  if (!payment || !order) return null;
  if (["success", "settlement", "capture"].includes(payment.transactionStatus || "")) {
    return { payment, order };
  }
  let newStatus = transactionStatus;
  if (transactionStatus === "capture") {
    newStatus = fraudStatus === "accept" ? "success" : "challenge";
  } else if (transactionStatus === "settlement") {
    newStatus = "settlement";
  } else if (["cancel", "deny", "expire"].includes(transactionStatus)) {
    newStatus = "failed";
  }
  payment.transactionStatus = transactionStatus;
  await payment.save();
  if (newStatus === "success" || newStatus === "settlement") {
    await accumulateCustomerSpent(order.buyerWa, order.price);
    order.status = "CONFIRMED";
    order.adminNote = "Pembayaran lunas \u2014 menunggu pengiriman akun manual oleh admin";
    await order.save();
    await Notification.create({
      title: `\u{1F4B0} Pembayaran Lunas: ${orderId}`,
      message: `Order ${orderId} dari ${order.buyerName} (${order.buyerWa}) \u2014 ${order.productName} ${order.packageName} \u2014 Rp ${order.price.toLocaleString("id-ID")} \u2014 Segera kirim akun via WA!`,
      type: "ORDER",
      isRead: false
    });
    try {
      const { getWhatsAppSettings: getWhatsAppSettings2, sendWhatsAppMessage: sendWhatsAppMessage2 } = await Promise.resolve().then(() => (init_whatsappService(), whatsappService_exports));
      const waSettings = await getWhatsAppSettings2();
      if (waSettings.fonteToken) {
        const adminPhone = waSettings.whatsappNumber;
        if (adminPhone) {
          const adminMessage = `\u{1F514} *PESANAN MASUK - PILONEKO*

Halo Admin, ada pembayaran yang baru saja dikonfirmasi!

\u{1F4DD} *Kode Transaksi:*
${orderId}

\u{1F464} *Data Pembeli:*
\u2022 Nama: ${order.buyerName}
\u2022 WhatsApp: ${order.buyerWa}
${order.buyerEmail ? `\u2022 Email: ${order.buyerEmail}` : ""}
${order.gameUserId ? `\u2022 Game ID: ${order.gameUserId}${order.gameServerId ? " / Server: " + order.gameServerId : ""}` : ""}
${order.notes ? `\u2022 Catatan: ${order.notes}` : ""}

\u{1F4E6} *Detail Pesanan:*
\u2022 Produk: ${order.productName}
\u2022 Paket: ${order.packageName}
\u2022 Total: Rp ${order.price.toLocaleString("id-ID")}

\u26A1 Segera kirim akun ke nomor WA pembeli di atas secara manual.

_Notifikasi otomatis dari sistem PILONEKO_`;
          await sendWhatsAppMessage2(adminPhone, adminMessage);
          console.log(`[WA] Notifikasi order ${orderId} dikirim ke admin ${adminPhone}`);
        }
        const buyerPhone = order.buyerWa;
        if (buyerPhone) {
          const buyerMessage = `\u2705 *Pembayaran Berhasil - PILONEKO*

Halo ${order.buyerName},

Pembayaran Anda telah dikonfirmasi!

\u{1F4CB} *Kode Transaksi:* ${orderId}
\u{1F4E6} *Produk:* ${order.productName}
\u{1F381} *Paket:* ${order.packageName}
\u{1F4B0} *Total:* Rp ${order.price.toLocaleString("id-ID")}
\u{1F4CA} *Status:* Sedang Diproses Admin \u{1F504}

Admin kami akan segera mengirimkan akun Anda melalui WhatsApp ini.
Mohon tunggu sebentar ya! \u{1F60A}

Terima kasih telah berbelanja di PILONEKO! \u{1F64F}`;
          await sendWhatsAppMessage2(buyerPhone, buyerMessage);
          console.log(`[WA] Konfirmasi pembayaran dikirim ke pembeli ${buyerPhone} untuk order ${orderId}`);
        }
      } else {
        console.log(`[WA] Skip notifikasi: token belum dikonfigurasi`);
      }
    } catch (waErr) {
      console.error("[WA] Notification error (non-fatal):", waErr);
    }
    return { payment, order };
  } else if (newStatus === "failed") {
    order.status = "CANCELLED";
    order.adminNote = `Pembayaran dibatalkan sistem: ${transactionStatus}`;
    await order.save();
    await Notification.create({
      title: `\u274C Pembayaran Gagal: ${orderId}`,
      message: `Order ${orderId} dari ${order.buyerName} dibatalkan. Status Midtrans: ${transactionStatus}.`,
      type: "PAYMENT",
      isRead: false
    });
  }
  await order.save();
  return { payment, order };
};
var processTopupMidtransStatus = async (orderId, transactionStatus, fraudStatus) => {
  const payment = await Payment.findOne({ orderId });
  const topupOrder = await TopupOrder_default.findOne({ invoice: orderId }).populate("productId");
  if (!payment || !topupOrder) return null;
  if (["success", "settlement", "capture"].includes(payment.transactionStatus || "")) {
    return { payment, order: topupOrder };
  }
  let newStatus = transactionStatus;
  if (transactionStatus === "capture") {
    newStatus = fraudStatus === "accept" ? "success" : "challenge";
  } else if (transactionStatus === "settlement") {
    newStatus = "settlement";
  } else if (["cancel", "deny", "expire"].includes(transactionStatus)) {
    newStatus = "failed";
  }
  payment.transactionStatus = transactionStatus;
  await payment.save();
  if (newStatus === "success" || newStatus === "settlement") {
    topupOrder.status = "PAID";
    await topupOrder.save();
    try {
      const product = topupOrder.productId;
      if (!product || !product.buyerSkuCode) {
        throw new Error("Product SKU code not found");
      }
      let customerNo = "";
      if (topupOrder.accountData) {
        const values = Object.values(topupOrder.accountData);
        customerNo = values.join("");
      }
      topupOrder.status = "PROCESSING";
      await topupOrder.save();
      const digiRes = await DigiflazzService.createTransaction(product.buyerSkuCode, customerNo, orderId);
      topupOrder.digiflazzResponse = digiRes;
      if (digiRes.status === "Sukses") {
        topupOrder.status = "SUCCESS";
      } else if (digiRes.status === "Gagal") {
        topupOrder.status = "FAILED";
      }
      await topupOrder.save();
    } catch (err) {
      topupOrder.status = "FAILED";
      topupOrder.digiflazzResponse = { error: err.message };
      await topupOrder.save();
    }
    await Notification.create({
      title: `\u{1F4B0} Topup Lunas: ${orderId}`,
      message: `Topup ${orderId} dari ${topupOrder.customerName}. Status Digiflazz: ${topupOrder.status}`,
      type: "ORDER",
      isRead: false
    });
  } else if (newStatus === "failed") {
    topupOrder.status = "FAILED";
    await topupOrder.save();
  }
  return { payment, order: topupOrder };
};

// server/routes/paymentRoutes.ts
var router6 = import_express8.default.Router();
var paymentRateLimit = (0, import_express_rate_limit.default)({
  windowMs: 5 * 60 * 1e3,
  max: 15,
  message: { error: "Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit." },
  standardHeaders: true,
  legacyHeaders: false
});
var generateOrderId = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 9e3 + 1e3)}`;
router6.get("/config", async (_req, res) => {
  try {
    const config = await getMidtransConfig();
    const digiSetting = await DigiflazzSetting_default.findOne().lean();
    res.json({
      clientKey: config.clientKey,
      isProduction: config.isProduction,
      isActive: config.serverKey ? true : false,
      digiflazzActive: digiSetting ? digiSetting.isActive !== false : true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router6.post("/create-transaction", paymentRateLimit, validate2(checkoutSchema), async (req, res) => {
  try {
    const { productId, packageId, buyerName, buyerWa, buyerEmail, gameUserId, gameServerId, notes, voucherCode, paymentMethod } = req.body;
    const config = await getMidtransConfig();
    const isMidtrans = paymentMethod !== "WHATSAPP";
    if (isMidtrans && !config.serverKey) {
      return res.status(503).json({ error: "Payment gateway belum dikonfigurasi. Hubungi admin." });
    }
    let snap = null;
    if (isMidtrans) {
      snap = new import_midtrans_client2.default.Snap({
        isProduction: config.isProduction,
        serverKey: config.serverKey,
        clientKey: config.clientKey
      });
    }
    const product = await Product_default.findById(productId);
    if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });
    const pkg = product.packages.find(
      (p) => p._id.toString() === packageId || p.id === packageId
    );
    if (!pkg) return res.status(404).json({ error: "Paket tidak ditemukan" });
    let finalPrice = pkg.price;
    const orderId = generateOrderId();
    const newOrder = new Order_default({
      refCode: orderId,
      productId: product._id,
      packageId: pkg._id,
      buyerName,
      buyerWa,
      buyerEmail,
      gameUserId,
      gameServerId,
      notes,
      voucherCode,
      productName: product.name,
      packageName: pkg.label,
      price: finalPrice,
      status: "PENDING",
      adminNote: ""
    });
    await newOrder.save();
    await trackCustomerOrder(buyerName, buyerWa, buyerEmail, newOrder._id, orderId, finalPrice);
    const newPayment = new Payment({
      orderId,
      buyerWa,
      amount: finalPrice,
      productName: `${product.name} - ${pkg.label}`,
      transactionStatus: "pending"
    });
    await newPayment.save();
    let snapToken = "";
    let redirectUrl = "";
    if (isMidtrans && snap) {
      try {
        const transaction = await snap.createTransaction({
          transaction_details: {
            order_id: orderId,
            gross_amount: Math.round(finalPrice)
          },
          customer_details: {
            first_name: buyerName,
            phone: buyerWa
          },
          item_details: [
            {
              id: pkg._id.toString(),
              price: Math.round(finalPrice),
              quantity: 1,
              name: `${product.name} - ${pkg.label}`.substring(0, 50)
            }
          ],
          enabled_payments: [
            "credit_card",
            "bca_va",
            "bni_va",
            "bri_va",
            "mandiri_bill",
            "permata_va",
            "gopay",
            "shopeepay",
            "dana",
            "qris"
          ]
        });
        snapToken = transaction.token;
        redirectUrl = transaction.redirect_url;
        newPayment.snapToken = snapToken;
        newPayment.snapRedirectUrl = redirectUrl;
        await newPayment.save();
      } catch (snapError) {
        console.error("Midtrans Snap Error:", snapError.message);
        return res.status(500).json({
          error: `Gagal terhubung ke gateway pembayaran Midtrans: ${snapError.message}. Pastikan Midtrans Key valid!`
        });
      }
    } else {
      newPayment.transactionStatus = "pending";
      await newPayment.save();
    }
    const waSettings = await getWhatsAppSettings();
    const storeWaNumberRaw = waSettings.whatsappNumber || process.env.STORE_WA || "08123456789";
    let finalWa = storeWaNumberRaw.replace(/\D/g, "");
    if (finalWa.startsWith("0")) {
      finalWa = "62" + finalWa.substring(1);
    } else if (!finalWa.startsWith("62")) {
      finalWa = "62" + finalWa;
    }
    const waText = `*\u{1F514} KONFIRMASI PEMBAYARAN - PILONEKO*

Halo Admin, saya telah membuat pesanan dan ingin mengonfirmasi pembayaran saya dengan detail berikut:

*\u{1F4DD} KODE TRANSAKSI:* 
${orderId}

*\u{1F464} DETAIL PEMBELI*
\u2022 Nama: ${buyerName}
\u2022 WhatsApp: ${buyerWa}

*\u{1F4E6} DETAIL PESANAN*
\u2022 Produk: ${product.name}
\u2022 Paket: ${pkg.label}
\u2022 Total Tagihan: Rp ${finalPrice.toLocaleString("id-ID")}

Berikut saya lampirkan bukti transfer pembayaran saya. Mohon segera diproses ya min, terima kasih! \u{1F64F}`;
    const waUrl = `https://api.whatsapp.com/send/?phone=${finalWa}&text=${encodeURIComponent(waText)}`;
    res.json({
      success: true,
      refCode: orderId,
      snapToken,
      redirectUrl,
      waUrl,
      clientKey: config.clientKey
    });
  } catch (error) {
    console.error("Create Payment Error:", error);
    res.status(500).json({ error: error.message || "Terjadi kesalahan sistem" });
  }
});
router6.post("/notification", async (req, res) => {
  const notificationJson = req.body;
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
    payment_type
  } = notificationJson;
  let signatureValid = false;
  try {
    const config = await getMidtransConfig();
    const serverKey = config.serverKey;
    const hash = import_crypto4.default.createHash("sha512").update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest("hex");
    signatureValid = hash === signature_key;
  } catch {
  }
  try {
    await WebhookLog.create({
      orderId: order_id || "unknown",
      transactionStatus: transaction_status || "unknown",
      paymentType: payment_type || "unknown",
      grossAmount: gross_amount || "0",
      signatureValid,
      rawPayload: JSON.stringify(notificationJson),
      processedAt: /* @__PURE__ */ new Date()
    });
  } catch (logErr) {
    console.error("Failed to save webhook log:", logErr);
  }
  if (!signatureValid) {
    return res.status(401).json({ error: "Invalid signature" });
  }
  try {
    await processMidtransStatus(order_id, transaction_status, fraud_status);
    res.status(200).json({ status: "OK" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: error.message });
  }
});
router6.get("/status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    let payment = await Payment.findOne({ orderId });
    let order = await Order_default.findOne({ refCode: orderId });
    let topupOrder = null;
    if (!order) {
      topupOrder = await TopupOrder_default.findOne({ invoice: orderId });
    }
    if (!payment || !order && !topupOrder) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }
    if (payment.transactionStatus === "pending" && payment.snapToken) {
      try {
        const config = await getMidtransConfig();
        if (config.serverKey) {
          const coreApi = new import_midtrans_client2.default.CoreApi({
            isProduction: config.isProduction,
            serverKey: config.serverKey,
            clientKey: config.clientKey
          });
          const midtransStatus = await coreApi.transaction.status(orderId);
          if (midtransStatus && midtransStatus.transaction_status && midtransStatus.transaction_status !== "pending") {
            const synced = await processMidtransStatus(orderId, midtransStatus.transaction_status, midtransStatus.fraud_status);
            if (synced) {
              payment = synced.payment;
              if (order) order = synced.order;
              else topupOrder = synced.order;
            }
          }
        }
      } catch (syncErr) {
        console.error("Midtrans sync error:", syncErr);
      }
    }
    res.json({
      success: true,
      orderId: payment.orderId,
      productName: payment.productName,
      amount: payment.amount,
      buyerName: order ? order.buyerName : topupOrder.customerName,
      buyerWa: payment.buyerWa,
      transactionStatus: payment.transactionStatus,
      orderStatus: order ? order.status : topupOrder.status,
      createdAt: payment.createdAt,
      snapToken: payment.snapToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router6.get("/stats/today", async (_req, res) => {
  try {
    const todayStart = /* @__PURE__ */ new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [totalToday, successToday, pendingToday, revenueResult] = await Promise.all([
      Payment.countDocuments({ createdAt: { $gte: todayStart } }),
      Payment.countDocuments({
        createdAt: { $gte: todayStart },
        transactionStatus: { $in: ["settlement", "capture"] }
      }),
      Payment.countDocuments({
        createdAt: { $gte: todayStart },
        transactionStatus: "pending"
      }),
      Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStart },
            transactionStatus: { $in: ["settlement", "capture"] }
          }
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);
    res.json({
      totalToday,
      successToday,
      pendingToday,
      revenueToday: revenueResult[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var paymentRoutes_default = router6;

// server/routes/stockRoutes.ts
var import_express9 = __toESM(require("express"));
var router7 = import_express9.default.Router();
router7.get("/", authenticateAdmin, async (req, res) => {
  try {
    const stocks = await AccountStock_default.find({}).sort({ createdAt: -1 }).lean();
    const products = await Product_default.find({}).lean();
    const mapped = stocks.map((st) => {
      let pkg = null;
      let matchedProduct = null;
      for (const prod of products) {
        const found = prod.packages.find((p) => p._id?.toString() === st.packageId.toString());
        if (found) {
          pkg = found;
          matchedProduct = prod;
          break;
        }
      }
      return {
        id: st._id,
        packageId: st.packageId,
        username: st.emailAkun,
        password: st.passwordAkun,
        isSold: st.status !== "AVAILABLE",
        package: pkg ? { ...pkg, product: matchedProduct } : null
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router7.get("/:packageId", authenticateAdmin, async (req, res) => {
  try {
    const { packageId } = req.params;
    const stocks = await AccountStock_default.find({ packageId }).sort({ soldAt: -1 }).lean();
    const product = await Product_default.findOne({ "packages._id": packageId }).lean();
    const pkg = product?.packages.find((p) => p._id?.toString() === packageId);
    const mapped = stocks.map((st) => ({
      id: st._id,
      packageId: st.packageId,
      username: st.emailAkun,
      password: st.passwordAkun,
      isSold: st.status !== "AVAILABLE",
      package: pkg ? { ...pkg, product } : null
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router7.post("/", authenticateAdmin, async (req, res) => {
  try {
    const { packageId, usernames, password } = req.body;
    if (!packageId || !usernames || !Array.isArray(usernames) || !password) {
      return res.status(400).json({ error: "Missing required details" });
    }
    const docs = usernames.filter((u) => u).map((username) => ({
      packageId,
      emailAkun: username,
      passwordAkun: password,
      status: "AVAILABLE"
    }));
    await AccountStock_default.insertMany(docs);
    const count = await AccountStock_default.countDocuments({ packageId, status: "AVAILABLE" });
    await Product_default.updateOne(
      { "packages._id": packageId },
      { $set: { "packages.$.stockCount": count } }
    );
    res.json({ success: true, count: docs.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router7.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await AccountStock_default.findByIdAndDelete(id);
    if (stock) {
      const count = await AccountStock_default.countDocuments({ packageId: stock.packageId, status: "AVAILABLE" });
      await Product_default.updateOne(
        { "packages._id": stock.packageId },
        { $set: { "packages.$.stockCount": count } }
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var stockRoutes_default = router7;

// server/routes/webhookLogRoutes.ts
var import_express10 = __toESM(require("express"));
var router8 = import_express10.default.Router();
router8.get("/", authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const status = req.query.status;
    const filter = {};
    if (status && status !== "all") {
      filter.transactionStatus = status;
    }
    const total = await WebhookLog.countDocuments(filter);
    const logs = await WebhookLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
    res.json({
      logs: logs.map((l) => ({ ...l, id: l._id })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router8.get("/:id", authenticateAdmin, async (req, res) => {
  try {
    const log = await WebhookLog.findById(req.params.id).lean();
    if (!log) return res.status(404).json({ error: "Log tidak ditemukan" });
    res.json({ ...log, id: log._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router8.delete("/cleanup", authenticateAdmin, async (_req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
    const result = await WebhookLog.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var webhookLogRoutes_default = router8;

// server/routes/whatsappRoutes.ts
var import_express11 = __toESM(require("express"));
init_WhatsApp();
init_whatsappService();
var router9 = import_express11.default.Router();
router9.get("/settings", authenticateAdmin, async (req, res) => {
  try {
    const settings = await getWhatsAppSettings();
    const isTokenSet = !!settings.fonteToken;
    res.json({
      ...settings.toObject(),
      fonteToken: isTokenSet ? "ENCRYPTED_TOKEN_SET" : ""
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router9.put("/settings", authenticateAdmin, async (req, res) => {
  try {
    const {
      whatsappNumber,
      adminName,
      fonteToken,
      // Either new token or "ENCRYPTED_TOKEN_SET"
      deviceId,
      enableWhatsAppCheckout,
      enableMidtransCheckout,
      defaultCheckoutMethod,
      autoOrderCreated,
      autoPaymentSuccess,
      autoOrderCompleted,
      autoWarrantyUpdate,
      autoSupportTicketReply,
      autoPaymentReminder,
      paymentReminderDelayHours
    } = req.body;
    const settings = await getWhatsAppSettings();
    if (fonteToken && fonteToken !== "ENCRYPTED_TOKEN_SET") {
      settings.fonteToken = encryptToken(fonteToken);
    }
    if (whatsappNumber !== void 0) settings.whatsappNumber = whatsappNumber;
    if (adminName !== void 0) settings.adminName = adminName;
    if (deviceId !== void 0) settings.deviceId = deviceId;
    if (enableWhatsAppCheckout !== void 0) settings.enableWhatsAppCheckout = enableWhatsAppCheckout;
    if (enableMidtransCheckout !== void 0) settings.enableMidtransCheckout = enableMidtransCheckout;
    if (defaultCheckoutMethod !== void 0) settings.defaultCheckoutMethod = defaultCheckoutMethod;
    if (autoOrderCreated !== void 0) settings.autoOrderCreated = autoOrderCreated;
    if (autoPaymentSuccess !== void 0) settings.autoPaymentSuccess = autoPaymentSuccess;
    if (autoOrderCompleted !== void 0) settings.autoOrderCompleted = autoOrderCompleted;
    if (autoWarrantyUpdate !== void 0) settings.autoWarrantyUpdate = autoWarrantyUpdate;
    if (autoSupportTicketReply !== void 0) settings.autoSupportTicketReply = autoSupportTicketReply;
    if (autoPaymentReminder !== void 0) settings.autoPaymentReminder = autoPaymentReminder;
    if (paymentReminderDelayHours !== void 0) settings.paymentReminderDelayHours = paymentReminderDelayHours;
    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router9.post("/test-connection", authenticateAdmin, async (req, res) => {
  try {
    const { fonteToken } = req.body;
    let encrypted = "";
    if (fonteToken && fonteToken !== "ENCRYPTED_TOKEN_SET") {
      encrypted = encryptToken(fonteToken);
    } else {
      const settings = await getWhatsAppSettings();
      encrypted = settings.fonteToken;
    }
    if (!encrypted) {
      return res.status(400).json({ error: "No token provided to test." });
    }
    const isConnected = await testFoonteConnection(encrypted);
    if (fonteToken === "ENCRYPTED_TOKEN_SET" || !fonteToken) {
      const settings = await getWhatsAppSettings();
      settings.isConnected = isConnected;
      await settings.save();
    }
    res.json({ success: isConnected });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router9.post("/send-test", authenticateAdmin, async (req, res) => {
  try {
    const { targetPhone, message } = req.body;
    if (!targetPhone || !targetPhone.trim()) {
      return res.status(400).json({ error: "Nomor tujuan wajib diisi." });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Pesan tidak boleh kosong." });
    }
    const settings = await getWhatsAppSettings();
    if (!settings.fonteToken) {
      return res.status(400).json({ error: "Token Fonnte belum dikonfigurasi. Simpan dulu WA Settings." });
    }
    const { sendWhatsAppMessage: sendWhatsAppMessage2 } = await Promise.resolve().then(() => (init_whatsappService(), whatsappService_exports));
    const success = await sendWhatsAppMessage2(targetPhone.trim(), message.trim());
    if (success) {
      res.json({ success: true, message: `Pesan test berhasil dikirim ke ${targetPhone}!` });
    } else {
      res.status(500).json({ error: "Gagal mengirim pesan. Pastikan token valid dan nomor benar." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router9.get("/logs", authenticateAdmin, async (req, res) => {
  try {
    const logs = await WhatsAppLog.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(logs.map((l) => ({ id: l._id, ...l })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router9.get("/dashboard-metrics", authenticateAdmin, async (req, res) => {
  try {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [todayCount, monthCount, successCount, failedCount, lastCampaign] = await Promise.all([
      WhatsAppLog.countDocuments({ createdAt: { $gte: today } }),
      WhatsAppLog.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      WhatsAppLog.countDocuments({ status: "SUCCESS" }),
      WhatsAppLog.countDocuments({ status: "FAILED" }),
      WhatsAppCampaign.findOne().sort({ createdAt: -1 }).lean()
    ]);
    const totalLogs = successCount + failedCount;
    const successRate = totalLogs > 0 ? (successCount / totalLogs * 100).toFixed(1) : "0";
    const failedRate = totalLogs > 0 ? (failedCount / totalLogs * 100).toFixed(1) : "0";
    res.json({
      todayCount,
      monthCount,
      successRate,
      failedRate,
      lastCampaignName: lastCampaign?.campaignName || "Tidak ada campaign"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router9.get("/campaigns", authenticateAdmin, async (req, res) => {
  try {
    const campaigns = await WhatsAppCampaign.find().sort({ createdAt: -1 }).lean();
    res.json(campaigns.map((c) => ({ id: c._id, ...c })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router9.post("/campaigns", authenticateAdmin, async (req, res) => {
  try {
    const campaign = await WhatsAppCampaign.create(req.body);
    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router9.post("/campaigns/:id/send", authenticateAdmin, async (req, res) => {
  try {
    const campaign = await WhatsAppCampaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    campaign.status = "SENDING";
    await campaign.save();
    let targetNumbers = [];
    if (campaign.targetCustomer === "SPECIFIC") {
      targetNumbers = campaign.specificNumbers || [];
    } else {
      targetNumbers = campaign.specificNumbers || [];
    }
    let success = 0;
    let failed = 0;
    for (const number of targetNumbers) {
      if (!number) continue;
      const isSent = await sendWhatsAppMessage(number, campaign.customMessage || "", campaign._id?.toString() || "");
      if (isSent) success++;
      else failed++;
      await new Promise((resolve) => setTimeout(resolve, 1e3));
    }
    campaign.successCount = success;
    campaign.failedCount = failed;
    campaign.status = "COMPLETED";
    await campaign.save();
    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var whatsappRoutes_default = router9;

// server/routes/customerRoutes.ts
var import_express12 = __toESM(require("express"));
var router10 = import_express12.default.Router();
router10.get("/", authenticateAdmin, async (req, res) => {
  try {
    const customers = await Customer_default.find().sort({ lastOrderDate: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router10.get("/stats", authenticateAdmin, async (req, res) => {
  try {
    const totalCustomers = await Customer_default.countDocuments();
    const now = /* @__PURE__ */ new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newCustomersThisMonth = await Customer_default.countDocuments({ createdAt: { $gte: startOfMonth } });
    const activeCustomers = await Customer_default.countDocuments({ lastOrderDate: { $gte: startOfMonth } });
    const topSpenders = await Customer_default.find().sort({ totalSpent: -1 }).limit(5);
    res.json({
      totalCustomers,
      newCustomersThisMonth,
      activeCustomers,
      topSpenders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router10.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    await Customer_default.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var customerRoutes_default = router10;

// server/routes/uploadRoutes.ts
var import_express13 = __toESM(require("express"));
var import_multer = __toESM(require("multer"));
var import_supabase_js = require("@supabase/supabase-js");
var router11 = import_express13.default.Router();
var BUCKET_NAME = "piloneko-uploads";
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return (0, import_supabase_js.createClient)(supabaseUrl, supabaseKey);
}
var fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format file tidak didukung. Gunakan JPG, PNG, WEBP, SVG, atau GIF."));
  }
};
var upload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  // simpan di RAM, lalu kirim ke Supabase
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
  // max 5MB
});
router11.post("/", authenticateAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Tidak ada file yang diupload." });
    }
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(503).json({
        error: "Layanan penyimpanan gambar belum dikonfigurasi. Hubungi admin untuk mengisi SUPABASE_URL dan SUPABASE_SERVICE_KEY."
      });
    }
    const ext = req.file.originalname.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
    const filePath = `uploads/${filename}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false
    });
    if (uploadError) {
      console.error("[Upload] Supabase error:", uploadError.message);
      return res.status(500).json({ error: `Gagal mengupload file: ${uploadError.message}` });
    }
    const { data: publicData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    const fileUrl = publicData.publicUrl;
    res.json({ success: true, url: fileUrl, filename });
  } catch (err) {
    console.error("[Upload] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
router11.delete("/:filename", authenticateAdmin, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(503).json({ error: "Layanan penyimpanan gambar belum dikonfigurasi." });
    }
    const filePath = `uploads/${req.params.filename}`;
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    if (error) {
      console.error("[Upload] Delete error:", error.message);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var uploadRoutes_default = router11;

// server/routes/adminGameRoutes.ts
var import_express14 = __toESM(require("express"));

// server/models/Game.ts
var import_mongoose18 = __toESM(require("mongoose"));
var gameSchema = new import_mongoose18.default.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String },
  description: { type: String },
  status: { type: Boolean, default: true }
}, { timestamps: true });
var Game = import_mongoose18.default.models.Game || import_mongoose18.default.model("Game", gameSchema);
var Game_default = Game;

// server/models/GameField.ts
var import_mongoose19 = __toESM(require("mongoose"));
var gameFieldSchema = new import_mongoose19.default.Schema({
  gameId: { type: import_mongoose19.default.Schema.Types.ObjectId, ref: "Game", required: true },
  fieldName: { type: String, required: true },
  // e.g., 'userId', 'zoneId'
  fieldLabel: { type: String, required: true },
  // e.g., 'User ID'
  placeholder: { type: String },
  validationPattern: { type: String },
  required: { type: Boolean, default: true }
}, { timestamps: true });
var GameField = import_mongoose19.default.models.GameField || import_mongoose19.default.model("GameField", gameFieldSchema);
var GameField_default = GameField;

// server/models/GameProduct.ts
var import_mongoose20 = __toESM(require("mongoose"));
var gameProductSchema = new import_mongoose20.default.Schema({
  gameId: { type: import_mongoose20.default.Schema.Types.ObjectId, ref: "Game", required: true },
  buyerSkuCode: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  margin: { type: Number, required: true, default: 0 },
  status: { type: Boolean, default: true }
}, { timestamps: true });
var GameProduct = import_mongoose20.default.models.GameProduct || import_mongoose20.default.model("GameProduct", gameProductSchema);
var GameProduct_default = GameProduct;

// server/routes/adminGameRoutes.ts
var router12 = import_express14.default.Router();
router12.use(authenticateAdmin);
router12.get("/dashboard-stats", async (req, res) => {
  try {
    const totalGames = await Game_default.countDocuments();
    const activeProducts = await GameProduct_default.countDocuments({ status: true });
    const successOrders = await TopupOrder_default.countDocuments({ status: { $in: ["SUCCESS", "PAID"] } });
    res.json({
      totalGames,
      activeProducts,
      successOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router12.get("/games", async (req, res) => {
  try {
    const games = await Game_default.find().sort({ createdAt: -1 });
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router12.post("/games", async (req, res) => {
  try {
    const { name, slug, logo, description, status } = req.body;
    const game = await Game_default.create({ name, slug, logo, description, status });
    res.json(game);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router12.put("/games/:id", async (req, res) => {
  try {
    const game = await Game_default.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(game);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router12.delete("/games/:id", async (req, res) => {
  try {
    await Game_default.findByIdAndDelete(req.params.id);
    await GameField_default.deleteMany({ gameId: req.params.id });
    await GameProduct_default.deleteMany({ gameId: req.params.id });
    res.json({ message: "Game deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router12.get("/games/:id/fields", async (req, res) => {
  try {
    const fields = await GameField_default.find({ gameId: req.params.id });
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router12.post("/games/:id/fields", async (req, res) => {
  try {
    const field = await GameField_default.create({ ...req.body, gameId: req.params.id });
    res.json(field);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router12.delete("/fields/:id", async (req, res) => {
  try {
    await GameField_default.findByIdAndDelete(req.params.id);
    res.json({ message: "Field deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router12.get("/digiflazz/settings", async (req, res) => {
  try {
    const settings = await DigiflazzService.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router12.put("/digiflazz/settings", async (req, res) => {
  try {
    let settings = await DigiflazzSetting_default.findOne();
    if (!settings) {
      settings = new DigiflazzSetting_default(req.body);
    } else {
      settings.username = req.body.username !== void 0 ? req.body.username : settings.username;
      settings.apiKey = req.body.apiKey !== void 0 ? req.body.apiKey : settings.apiKey;
      settings.isActive = req.body.isActive !== void 0 ? req.body.isActive : settings.isActive;
    }
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router12.post("/digiflazz/sync", async (req, res) => {
  try {
    const products = await DigiflazzService.getPrepaidProducts();
    console.log(`[Digiflazz Sync] Total products pulled from API: ${products.length}`);
    const games = await Game_default.find({ status: true });
    const brandToGameMap = new Map(games.map((g) => [g.name.toUpperCase(), g._id.toString()]));
    let syncedCount = 0;
    for (const p of products) {
      if (p.seller_product_status === false || p.buyer_product_status === false) continue;
      const brand = p.brand.toUpperCase();
      const gameId = brandToGameMap.get(brand);
      if (gameId) {
        const existing = await GameProduct_default.findOne({ buyerSkuCode: p.buyer_sku_code });
        if (existing) {
          existing.costPrice = p.price;
          if (p.seller_product_status === false) existing.status = false;
          await existing.save();
        } else {
          await GameProduct_default.create({
            gameId,
            buyerSkuCode: p.buyer_sku_code,
            productName: p.product_name,
            costPrice: p.price,
            sellingPrice: p.price + 500,
            // Default +500 margin
            margin: 500,
            status: true
          });
        }
        syncedCount++;
      }
    }
    console.log(`[Digiflazz Sync] Matched and synced products: ${syncedCount}`);
    res.json({ message: "Sync successful", syncedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router12.get("/products", async (req, res) => {
  try {
    const filter = {};
    if (req.query.gameId) filter.gameId = req.query.gameId;
    const products = await GameProduct_default.find(filter).populate("gameId", "name");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router12.put("/products/:id", async (req, res) => {
  try {
    const { sellingPrice, margin, status } = req.body;
    const prod = await GameProduct_default.findByIdAndUpdate(req.params.id, { sellingPrice, margin, status }, { new: true });
    res.json(prod);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router12.get("/orders", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const orders = await TopupOrder_default.find(filter).populate("gameId", "name logo").populate("productId", "productName").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var adminGameRoutes_default = router12;

// server/routes/gameRoutes.ts
var import_express15 = __toESM(require("express"));
var router13 = import_express15.default.Router();
router13.get("/", async (req, res) => {
  try {
    const games = await Game_default.find({ status: true }).sort({ name: 1 });
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router13.get("/:slug", async (req, res) => {
  try {
    const game = await Game_default.findOne({ slug: req.params.slug, status: true });
    if (!game) return res.status(404).json({ error: "Game not found" });
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router13.get("/:id/fields", async (req, res) => {
  try {
    const fields = await GameField_default.find({ gameId: req.params.id });
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router13.get("/:id/products", async (req, res) => {
  try {
    const products = await GameProduct_default.find({ gameId: req.params.id, status: true }).sort({ sellingPrice: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var gameRoutes_default = router13;

// server/routes/topupOrderRoutes.ts
var import_express16 = __toESM(require("express"));
var import_midtrans_client3 = __toESM(require("midtrans-client"));
init_whatsappService();
var import_express_rate_limit2 = __toESM(require("express-rate-limit"));
var import_crypto5 = __toESM(require("crypto"));
var router14 = import_express16.default.Router();
var topupRateLimit = (0, import_express_rate_limit2.default)({
  windowMs: 5 * 60 * 1e3,
  max: 15,
  message: { error: "Terlalu banyak permintaan topup. Silakan coba lagi nanti." },
  standardHeaders: true,
  legacyHeaders: false
});
var generateTopupOrderId = () => `TP-${Date.now()}-${Math.floor(Math.random() * 9e3 + 1e3)}`;
router14.post("/checkout", topupRateLimit, async (req, res) => {
  try {
    const { gameId, productId, accountData, buyerName, buyerWa, buyerEmail, paymentMethod = "MIDTRANS" } = req.body;
    const config = await getMidtransConfig();
    const isMidtrans = paymentMethod === "MIDTRANS";
    if (isMidtrans && !config.serverKey) {
      return res.status(503).json({ error: "Payment gateway Midtrans belum dikonfigurasi admin." });
    }
    let snap = null;
    if (isMidtrans) {
      snap = new import_midtrans_client3.default.Snap({
        isProduction: config.isProduction,
        serverKey: config.serverKey,
        clientKey: config.clientKey
      });
    }
    const product = await GameProduct_default.findById(productId);
    if (!product || !product.status) {
      return res.status(404).json({ error: "Produk Topup tidak ditemukan atau sedang tidak aktif." });
    }
    const orderId = generateTopupOrderId();
    const finalPrice = product.sellingPrice;
    const newOrder = new TopupOrder_default({
      invoice: orderId,
      customerName: buyerName,
      customerWa: buyerWa,
      customerEmail: buyerEmail,
      gameId,
      productId: product._id,
      accountData,
      paymentMethod,
      amount: finalPrice,
      status: "PENDING"
    });
    await newOrder.save();
    const newPayment = new Payment({
      orderId,
      buyerWa,
      amount: finalPrice,
      productName: `Topup - ${product.productName}`,
      transactionStatus: "pending"
    });
    await newPayment.save();
    let snapToken = "";
    let redirectUrl = "";
    if (isMidtrans && snap) {
      const transaction = await snap.createTransaction({
        transaction_details: {
          order_id: orderId,
          gross_amount: finalPrice
        },
        customer_details: {
          first_name: buyerName,
          phone: buyerWa,
          email: buyerEmail || "no-email@piloneko.com"
        },
        item_details: [
          {
            id: product.buyerSkuCode || product._id.toString(),
            price: finalPrice,
            quantity: 1,
            name: `Topup ${product.productName}`.substring(0, 50)
          }
        ]
      });
      snapToken = transaction.token;
      redirectUrl = transaction.redirect_url;
    }
    let waUrl = "";
    if (paymentMethod === "WHATSAPP") {
      const waSettings = await getWhatsAppSettings();
      const storeWaNumberRaw = waSettings.whatsappNumber || process.env.STORE_WA || "08123456789";
      let finalWa = storeWaNumberRaw.replace(/\D/g, "");
      if (finalWa.startsWith("0")) finalWa = "62" + finalWa.substring(1);
      else if (!finalWa.startsWith("62")) finalWa = "62" + finalWa;
      const waText = `*\u{1F514} KONFIRMASI TOPUP - PILONEKO*

Halo Admin, saya ingin topup dengan detail:

*\u{1F4DD} INVOICE:* ${orderId}

*\u{1F464} PEMBELI*
\u2022 Nama: ${buyerName}
\u2022 WhatsApp: ${buyerWa}

*\u{1F4E6} PESANAN*
\u2022 Produk: ${product.productName}
\u2022 Harga: Rp ${finalPrice.toLocaleString("id-ID")}

Berikut saya lampirkan bukti transfer pembayaran saya. Mohon segera diproses ya min, terima kasih! \u{1F64F}`;
      waUrl = `https://api.whatsapp.com/send/?phone=${finalWa}&text=${encodeURIComponent(waText)}`;
    }
    res.json({
      invoice: orderId,
      snapToken,
      redirectUrl,
      clientKey: config.clientKey,
      waUrl
    });
  } catch (error) {
    console.error("Topup Checkout Error:", error);
    res.status(500).json({ error: error.message || "Terjadi kesalahan sistem saat checkout topup" });
  }
});
router14.get("/status/:invoice", async (req, res) => {
  try {
    const order = await TopupOrder_default.findOne({ invoice: req.params.invoice });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({
      invoice: order.invoice,
      status: order.status,
      amount: order.amount,
      digiflazzResponse: order.digiflazzResponse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router14.post("/webhook/digiflazz", async (req, res) => {
  try {
    const signature = req.headers["x-hub-signature"] || req.headers["X-Hub-Signature"];
    const event = req.headers["x-digiflazz-event"] || req.headers["X-Digiflazz-Event"];
    const settings = await DigiflazzSetting_default.findOne();
    const secret = settings?.webhookSecret;
    if (secret && signature) {
      const payloadString = JSON.stringify(req.body);
      const expectedSignature = "sha1=" + import_crypto5.default.createHmac("sha1", secret).update(payloadString).digest("hex");
      if (expectedSignature !== signature) {
        console.warn("[Digiflazz Webhook] Signature mismatch. Expected:", expectedSignature, "Got:", signature);
      }
    }
    const data = req.body.data;
    if (!data || !data.ref_id) {
      return res.status(400).json({ error: "Invalid payload format" });
    }
    const { ref_id, status, message, sn } = data;
    console.log(`[Digiflazz Webhook] Received update for ${ref_id}: ${status}`);
    const order = await TopupOrder_default.findOne({ invoice: ref_id });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    let newStatus = order.status;
    if (status === "Sukses") {
      newStatus = "SUCCESS";
    } else if (status === "Gagal") {
      newStatus = "FAILED";
    } else if (status === "Pending") {
      newStatus = "PROCESSING";
    }
    order.status = newStatus;
    order.digiflazzResponse = data;
    await order.save();
    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Digiflazz Webhook Error:", error);
    res.status(500).json({ error: error.message });
  }
});
var topupOrderRoutes_default = router14;

// server/routes/seoRoutes.ts
var import_express17 = __toESM(require("express"));
var router15 = import_express17.default.Router();
router15.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = process.env.APP_URL || "https://piloneko.com";
    const products = await Product_default.find({ isActive: true }).select("slug updatedAt").lean();
    const categories = await Category_default.find().select("slug").lean();
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
    categories.forEach((cat) => {
      xml += `  <url>
    <loc>${baseUrl}/?category=${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });
    products.forEach((prod) => {
      xml += `  <url>
    <loc>${baseUrl}/product/${prod.slug}</loc>
    <lastmod>${new Date(prod.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });
    xml += `</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).end();
  }
});
router15.get("/robots.txt", (req, res) => {
  const baseUrl = process.env.APP_URL || "https://piloneko.com";
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`);
});
var seoRoutes_default = router15;

// server/utils/logger.ts
var import_winston = __toESM(require("winston"));
var { combine, timestamp, printf, colorize, errors } = import_winston.default.format;
var logFormat = printf(({ level, message, timestamp: timestamp2, stack }) => {
  return `${timestamp2} [${level}]: ${stack || message}`;
});
var logger = import_winston.default.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new import_winston.default.transports.Console({
      format: combine(colorize(), logFormat)
    })
  ]
});

// server/utils/response.ts
var ApiResponse = class {
  static success(res, statusCode, message, data) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }
  static error(res, statusCode, message, errors2) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors2
    });
  }
  static paginated(res, statusCode, message, data, meta) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta
    });
  }
};

// server/middlewares/error.middleware.ts
var globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  if (err.statusCode >= 500) {
    logger.error(`[${req.method} ${req.url}] ${err.stack}`);
  } else {
    logger.warn(`[${req.method} ${req.url}] ${err.message}`);
  }
  if (err.name === "CastError") {
    err = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }
  if (err.code === 11e3) {
    const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
    err = new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
  }
  if (err.name === "ValidationError") {
    const errors2 = Object.values(err.errors).map((el) => el.message);
    err = new AppError(`Invalid input data. ${errors2.join(". ")}`, 400);
  }
  if (err.name === "JsonWebTokenError") {
    err = new AppError("Invalid token. Please log in again!", 401);
  }
  if (err.name === "TokenExpiredError") {
    err = new AppError("Your token has expired! Please log in again.", 401);
  }
  if (process.env.NODE_ENV === "production") {
    if (err.isOperational) {
      return ApiResponse.error(res, err.statusCode, err.message);
    }
    return ApiResponse.error(res, 500, "Something went very wrong!");
  }
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

// server/app.ts
var app = (0, import_express18.default)();
var IS_PRODUCTION = process.env.NODE_ENV === "production";
app.use(
  (0, import_helmet.default)({
    contentSecurityPolicy: IS_PRODUCTION ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "app.midtrans.com", "api.midtrans.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "res.cloudinary.com", "*.supabase.co", "*"],
        connectSrc: ["'self'", "api.midtrans.com", "app.midtrans.com", "*.supabase.co"],
        frameSrc: ["'self'", "app.midtrans.com"]
      }
    } : false,
    // Disable CSP di dev mode agar Vite HMR bisa jalan
    crossOriginEmbedderPolicy: false
  })
);
app.use((0, import_hpp.default)());
app.use((0, import_compression.default)());
var apiLimiter = (0, import_express_rate_limit3.default)({
  windowMs: 1 * 60 * 1e3,
  // 1 menit
  max: 200,
  // Limit 200 request per menit per IP
  message: { error: "Terlalu banyak permintaan dari IP ini, coba lagi nanti." },
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/", apiLimiter);
var allowedOrigins = process.env.APP_URL ? [process.env.APP_URL, "https://piloneko.com", "http://localhost:3000", "http://localhost:5173"] : ["https://piloneko.com", "http://localhost:3000", "http://localhost:5173"];
app.use(
  (0, import_cors.default)({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith("vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} tidak diizinkan`));
      }
    },
    credentials: true
  })
);
app.use(import_express18.default.json({ limit: "10mb" }));
app.use(import_express18.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, import_cookie_parser.default)());
db_default().catch((err) => console.error("Initial DB connection failed:", err.message));
app.use("/", seoRoutes_default);
app.use("/api/products", publicProductRoutes);
app.use("/api/categories", publicCategoryRoutes);
app.use("/api/orders", orderRoutes_default);
app.use("/api/payment", paymentRoutes_default);
app.use("/api/topup-games", gameRoutes_default);
app.use("/api/topup-orders", topupOrderRoutes_default);
app.use("/api/admin", auth_routes_default);
app.use("/api/admin", adminCategoryRoutes);
app.use("/api/admin", adminProductRoutes);
app.use("/api/admin/stocks", stockRoutes_default);
app.use("/api/admin/payment-settings", paymentSettingsRoutes_default);
app.use("/api/admin/webhook-logs", webhookLogRoutes_default);
app.use("/api/admin/whatsapp", whatsappRoutes_default);
app.use("/api/admin/customers", customerRoutes_default);
app.use("/api/admin/topup", adminGameRoutes_default);
app.use("/api/admin/upload", uploadRoutes_default);
app.use("/api/admin", adminRoutes_default);
app.use("/api", publicRoutes_default);
app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    database: "MongoDB Atlas",
    environment: process.env.NODE_ENV || "development",
    platform: process.env.VERCEL ? "Vercel Serverless" : "Node.js Server"
  });
});
app.get("/api/debug-env", async (_req, res) => {
  let dbStatus = "UNKNOWN";
  let dbError = null;
  try {
    const mongoose21 = require("mongoose");
    if (mongoose21.connection.readyState !== 1) {
      await db_default();
    }
    const state = mongoose21.connection.readyState;
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    dbStatus = states[state] || "UNKNOWN";
    if (state === 1) {
      const collections = await mongoose21.connection.db.listCollections().toArray();
      dbStatus += ` (collections count: ${collections.length})`;
    }
  } catch (err) {
    dbStatus = "ERROR";
    dbError = err.message;
  }
  res.json({
    NODE_ENV: process.env.NODE_ENV || "MISSING",
    MONGO_URI: process.env.MONGO_URI ? "SET \u2713" : "MISSING \u2717",
    JWT_SECRET: process.env.JWT_SECRET ? "SET \u2713" : "MISSING \u2717",
    SESSION_SECRET: process.env.SESSION_SECRET ? "SET \u2713" : "MISSING \u2717",
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ? "SET \u2713" : "MISSING \u2717",
    VERCEL: process.env.VERCEL || "false",
    dbStatus,
    dbError
  });
});
if (IS_PRODUCTION && !process.env.VERCEL) {
  const distPath = import_path.default.join(process.cwd(), "dist");
  const publicPath = import_path.default.join(process.cwd(), "public");
  app.use(import_express18.default.static(publicPath));
  app.use(import_express18.default.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(import_path.default.join(distPath, "index.html"));
  });
}
app.use(globalErrorHandler);
var app_default = app;
//# sourceMappingURL=index.js.map
