// Classe condivisa per i <select> nativi, allineata allo stile degli input shadcn.
// Usiamo select nativi (non shadcn/Base UI) dove serve la submission diretta
// via FormData o form GET.
export const nativeSelect =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50";
