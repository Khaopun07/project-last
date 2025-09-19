// src/app/index/admin_officer/book/page.tsx
import BookingClient from './BookingClient';

export default function BookingPage() {
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📋 การจองกิจกรรมแนะแนว</h1>
      <BookingClient />
    </main>
  );
}
