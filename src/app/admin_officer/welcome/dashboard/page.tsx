import DashboardClient from './DashboardClient';

// Define the types for the data we expect from the API.
// These types are based on what DashboardClient needs.
interface ApiSchool {
  Sc_province: string;
  // The API likely returns `is_approved` as a number (0 or 1), not a status string.
  // This change aligns the expected data with what DashboardClient uses.
  is_approved: number;
  [key: string]: any;
}

interface ApiGuidance {
  Category: string | null;
  guidance_date: string | Date | null;
  [key: string]: any;
}

interface ApiBooking {
  Book_ID: string | number;
  guidance_date: string | Date | null;
  [key: string]: any;
}

/**
 * Fetches all necessary data for the dashboard from the API.
 * This function runs on the server.
 */
async function getDashboardData() {
  // For server-side fetching, an absolute URL is required.
  // This should be configured via environment variables for production.
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`;

  // Fetch all data in parallel to improve loading times.
  // { cache: 'no-store' } ensures we always get the latest data.
  const [schoolsRes, guidancesRes, bookingsRes] = await Promise.all([
    fetch(`${apiBaseUrl}/api/school`, { cache: 'no-store' }),
    fetch(`${apiBaseUrl}/api/auth/guidance_ad`, { cache: 'no-store' }), // Use the admin guidance route which returns stats
    fetch(`${apiBaseUrl}/api/auth/book`, { cache: 'no-store' }),
  ]);

  // If any of the API calls fail, throw an error to be caught by the component.
  if (!schoolsRes.ok) {
    throw new Error(`Failed to fetch schools: ${schoolsRes.statusText}`);
  }
  if (!guidancesRes.ok) {
    throw new Error(`Failed to fetch guidances: ${guidancesRes.statusText}`);
  }
  if (!bookingsRes.ok) {
    throw new Error(`Failed to fetch bookings: ${bookingsRes.statusText}`);
  }

  // Parse the JSON from the responses.
  const schoolsData = await schoolsRes.json();
  const guidancesData = await guidancesRes.json();
  const bookingsData = await bookingsRes.json();

  // Extract the arrays from the response objects. This makes the function more robust.
  // It can handle direct arrays `[...]` or nested objects like `{ data: [...] }` or `{ guidances: [...] }`.
  const schools: ApiSchool[] = Array.isArray(schoolsData) ? schoolsData : schoolsData.data || [];
  const guidances: ApiGuidance[] = guidancesData.guidances || (Array.isArray(guidancesData) ? guidancesData : guidancesData.data || []);
  const bookings: ApiBooking[] = Array.isArray(bookingsData) ? bookingsData : bookingsData.data || [];

  return { schools, guidances, bookings };
}

/**
 * This is the main page component for the dashboard.
 * It's a Server Component, which allows us to fetch data on the server before rendering.
 */
export default async function DashboardPage() {
  try {
    // Await the data from our fetching function.
    const { schools, guidances, bookings } = await getDashboardData();

    // The data from the API should now match what the client component expects.
    // We can pass the `schools` array directly to `initialSchools` without transformation.
    return (
      <DashboardClient
        initialSchools={schools}
        initialGuidances={guidances}
        initialBookings={bookings}
      />
    );
  } catch (error) {
    // If an error occurs during data fetching, render a user-friendly error message.
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return (
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-gray-600">ไม่สามารถโหลดข้อมูลแดชบอร์ดได้</p>
          <p className="text-sm text-gray-500 mt-4">({errorMessage})</p>
        </div>
      </main>
    );
  }
}