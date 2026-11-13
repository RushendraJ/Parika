export type Section = "jewellery" | "ethnic-wear";

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  role: "user" | "admin";
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  section: Section;
  category: string;
  price: number;
  mrp: number | null;
  imageUrl: string | null;
  inStock: boolean;
  createdAt: string;
};

export type CartLine = { id: string; quantity: number; product: Product };
export type WishlistLine = { id: string; product: Product };

export type OrderItem = { product?: string; name: string; price: number; quantity: number; imageUrl: string | null };

export type Order = {
  id: string;
  total: number;
  status: string;
  paymentMethod: "cod" | "online" | "upi";
  upiUtr?: string | null;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  createdAt: string;
};

export type AuthResponse = { token: string; user: User };
