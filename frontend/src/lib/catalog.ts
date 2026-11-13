import necklaces from "@/assets/categories/necklaces.jpg";
import earrings from "@/assets/categories/earrings-chandbali.jpg";
import bangles from "@/assets/categories/bangles.jpg";
import maangTikka from "@/assets/categories/maang-tikka.jpg";
import rings from "@/assets/categories/rings.jpg";
import bridalSets from "@/assets/categories/bridal-sets.jpg";
import sarees from "@/assets/categories/sarees.jpg";
import suits from "@/assets/categories/suits.jpg";
import lehengas from "@/assets/categories/lehengas.jpg";
import kurtis from "@/assets/categories/kurtis.jpg";
import dupattas from "@/assets/categories/dupattas.jpg";
import anarkalis from "@/assets/categories/anarkalis.jpg";

export type Category = { name: string; note: string; image: string };

export const jewelleryCategories: Category[] = [
  { name: "Necklaces", note: "Kundan, polki & pearl", image: necklaces },
  { name: "Earrings", note: "Jhumkas, studs & drops", image: earrings },
  { name: "Bangles", note: "Kadas & stacked sets", image: bangles },
  { name: "Maang Tikka", note: "Bridal & festive", image: maangTikka },
  { name: "Rings", note: "Cocktail statement rings", image: rings },
  { name: "Bridal Sets", note: "Complete wedding looks", image: bridalSets },
];

export const ethnicCategories: Category[] = [
  { name: "Sarees", note: "Silk, georgette & banarasi", image: sarees },
  { name: "Suits", note: "Salwar & palazzo sets", image: suits },
  { name: "Lehengas", note: "Bridal & party wear", image: lehengas },
  { name: "Kurtis", note: "Everyday elegance", image: kurtis },
  { name: "Dupattas", note: "Embroidered & zari", image: dupattas },
  { name: "Anarkalis", note: "Flowing festive gowns", image: anarkalis },
];
