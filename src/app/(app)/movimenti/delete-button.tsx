"use client";

export function DeleteTransactionButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Eliminare definitivamente questo movimento?")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-sm font-medium text-red-600 hover:underline"
      >
        Elimina
      </button>
    </form>
  );
}
