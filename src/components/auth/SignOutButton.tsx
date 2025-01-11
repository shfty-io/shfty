'use client';

export function SignOutButton() {
  return (
    <form action="/auth/signout" method="POST">
      <button
        type="submit"
        className="bg-red-100 text-red-600 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
      >
        Sign Out
      </button>
    </form>
  );
} 