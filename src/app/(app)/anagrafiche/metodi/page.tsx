import { getAllPaymentMethods } from "@/lib/data/anagrafiche";
import { PaymentMethodsManager } from "../payment-methods-manager";

export default async function MetodiPage() {
  const items = await getAllPaymentMethods();
  return (
    <PaymentMethodsManager
      items={items.map((m) => ({
        id: m.id,
        name: m.name,
        active: m.active,
      }))}
    />
  );
}
