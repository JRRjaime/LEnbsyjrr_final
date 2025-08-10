"use client";

import Link from "next/link";

export default function AuthButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/login"
      className={
        className ||
        "inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700 active:scale-95"
      }
    >
      Únete ahora
    </Link>
  );
}
