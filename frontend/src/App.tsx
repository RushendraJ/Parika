import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { WhatsAppButton } from "@/components/whatsapp-button";
import AdminPage from "@/pages/AdminPage";
import AuthPage from "@/pages/AuthPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import EthnicWearPage from "@/pages/EthnicWearPage";
import HomePage from "@/pages/HomePage";
import JewelleryPage from "@/pages/JewelleryPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProfilePage from "@/pages/ProfilePage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import WishlistPage from "@/pages/WishlistPage";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <SiteHeader />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jewellery" element={<JewelleryPage />} />
          <Route path="/ethnic-wear" element={<EthnicWearPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <SiteFooter />
      <WhatsAppButton />
      <Toaster position="top-center" />
    </div>
  );
}
