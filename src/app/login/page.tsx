import { Card } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Cassa Luxury
          </p>
          <h1 className="mt-1 text-xl font-semibold">Accedi</h1>
        </div>
        <LoginForm />
      </Card>
    </main>
  );
}
