import { ListsHome } from "@/components/lists/lists-home";
import { SiteJsonLd } from "@/components/site-json-ld";

export const metadata = {
  title: "Suas listas",
  description: "As listas de desejos da sua conta Wishly.",
  alternates: { canonical: "/" },
};

export default function ListsPage() {
  return (
    <>
      <SiteJsonLd />
      <ListsHome />
    </>
  );
}
