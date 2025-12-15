import { TaxCalculator } from "@/components/TaxCalculator";
import pkg from "../../package.json";

export default function Home() {
  return <TaxCalculator appVersion={pkg.version} />;
}
