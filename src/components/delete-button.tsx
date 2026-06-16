"use client";

export function DeleteButton({
  action,
  message = "Eliminare definitivamente questo elemento?",
  label = "Elimina",
}: {
  action: () => Promise<void>;
  message?: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="text-sm font-medium text-red-600 hover:underline"
      >
        {label}
      </button>
    </form>
  );
}
