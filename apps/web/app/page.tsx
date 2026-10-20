import { HomeLanding } from "../components/home/home-landing";
import { PublicFooter, PublicHeader } from "../components/public/public-shell";

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <HomeLanding />
      <PublicFooter />
    </>
  );
}
