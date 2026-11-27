"use client";

export function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="mt-6 inline-flex h-12 w-fit cursor-pointer items-center rounded-lg bg-accent px-4 font-semibold text-white"
    >
      Tentar de novo
    </button>
  );
}
