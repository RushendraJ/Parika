import jewelleryPhoto from "@/assets/parika-peacock-ear-chain.jpg";
import { ShopSection } from "@/components/shop-section";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function JewelleryPage() {
  useDocumentTitle("Jewellery — Parika");
  return <ShopSection section="jewellery" title="Jewellery" image={jewelleryPhoto} />;
}
