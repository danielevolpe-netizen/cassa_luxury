import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Cassa Luxury
          </p>
          <h1 className="mt-1 text-xl font-semibold">Accedi</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
