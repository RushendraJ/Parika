import heroEthnic from "@/assets/hero-ethnic.jpg";
import { ShopSection } from "@/components/shop-section";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function EthnicWearPage() {
  useDocumentTitle("Ethnic Wear — Parika");
  return <ShopSection section="ethnic-wear" title="Ethnic Wear" image={heroEthnic} />;
}
