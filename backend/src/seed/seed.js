import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import { assertEnv, env } from "../config/env.js";
import { CartItem } from "../models/CartItem.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { WishlistItem } from "../models/WishlistItem.js";

// Same starter catalogue the original project shipped with
const products = [
  ["Kundan Choker Necklace Set", "Gold-tone kundan choker with matching earrings.", "jewellery", "Necklaces", 1499, 2499],
  ["Pearl Layered Rani Haar", "Three-layer pearl haar for festive wear.", "jewellery", "Necklaces", 1899, 2999],
  ["Chandbali Earrings", "Pink stone chandbalis with pearl drops.", "jewellery", "Earrings", 699, 1199],
  ["Peacock Jhumka with Ear Chain", "Enamel peacock jhumkas with pearl ear chain.", "jewellery", "Earrings", 899, 1499],
  ["Antique Gold Kada Pair", "Broad carved kadas, adjustable.", "jewellery", "Bangles", 999, 1599],
  ["Polki Maang Tikka", "Bridal polki tikka with pearl hangings.", "jewellery", "Maang Tikka", 549, 899],
  ["Emerald Cocktail Ring", "Adjustable statement ring with green stone.", "jewellery", "Rings", 399, 699],
  ["Bridal Jewellery Set", "Necklace, earrings, tikka and nath set.", "jewellery", "Bridal Sets", 4999, 7999],
  ["Banarasi Silk Saree", "Maroon banarasi silk with zari border.", "ethnic-wear", "Sarees", 3499, 5499],
  ["Georgette Party Saree", "Lightweight georgette with sequin work.", "ethnic-wear", "Sarees", 2199, 3299],
  ["Embroidered Palazzo Suit", "Cotton suit with palazzo and dupatta.", "ethnic-wear", "Suits", 1799, 2799],
  ["Bridal Lehenga Choli", "Heavy embroidered lehenga with net dupatta.", "ethnic-wear", "Lehengas", 8999, 13999],
  ["Printed Cotton Kurti", "Everyday A-line kurti.", "ethnic-wear", "Kurtis", 699, 1099],
  ["Zari Dupatta", "Chanderi dupatta with zari border.", "ethnic-wear", "Dupattas", 599, 999],
  ["Flared Anarkali Gown", "Floor-length anarkali with gota work.", "ethnic-wear", "Anarkalis", 2799, 4299],
].map(([name, description, section, category, price, mrp]) => ({ name, description, section, category, price, mrp }));

async function seedAdmin() {
  if (!env.adminEmail) return console.log("ADMIN_EMAIL not set - skipping admin account.");
  let admin = await User.findOne({ email: env.adminEmail });
  if (admin) {
    admin.role = "admin";
    await admin.save();
    return console.log(`Existing account ${env.adminEmail} is now an admin.`);
  }
  if (env.adminPassword.length < 8) {
    return console.log("ADMIN_PASSWORD (8+ chars) not set - admin account not created. Sign up in the app instead; ADMIN_EMAIL gets admin automatically.");
  }
  admin = new User({ email: env.adminEmail, fullName: env.adminName, role: "admin" });
  await admin.setPassword(env.adminPassword);
  await admin.save();
  console.log(`Admin account created: ${env.adminEmail}`);
}

async function run() {
  assertEnv();
  await connectDB();

  if (process.argv.includes("--destroy")) {
    await Promise.all([Product.deleteMany(), CartItem.deleteMany(), WishlistItem.deleteMany()]);
    console.log("Products, carts and wishlists removed.");
  } else {
    if ((await Product.countDocuments()) === 0) {
      await Product.insertMany(products);
      console.log(`Inserted ${products.length} products.`);
    } else {
      console.log("Products already exist - skipping product seed.");
    }
    await seedAdmin();
  }
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
