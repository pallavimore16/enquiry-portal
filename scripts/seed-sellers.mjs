// One-time script to create the 5 seller accounts. Run locally with:
//   node --env-file=.env.seed scripts/seed-sellers.mjs
//
// Uses a plain fetch() call to Supabase's Admin REST API directly,
// rather than the @supabase/supabase-js client — that client also spins
// up a realtime/WebSocket connection we don't need here, which requires
// Node 22+. A direct fetch avoids that entirely and works on Node 18+.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
    "Create a .env.seed file (see instructions) — do NOT put the service " +
    "role key in .env.local, it must never reach the browser."
  );
  process.exit(1);
}

const sellers = [
  { email: "seller1@cosocket-portal-demo.com", full_name: "Seller One" },
  { email: "seller2@cosocket-portal-demo.com", full_name: "Seller Two" },
  { email: "seller3@cosocket-portal-demo.com", full_name: "Seller Three" },
  { email: "seller4@cosocket-portal-demo.com", full_name: "Seller Four" },
  { email: "cosocket8@gmail.com", full_name: "Cosocket Seller" },
];

for (const s of sellers) {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({
      email: s.email,
      password: "12345678",
      email_confirm: true,
      user_metadata: { full_name: s.full_name },
    }),
  });

  const body = await res.json();

  if (!res.ok) {
    console.error(`FAILED  ${s.email}: ${body.message || body.error_description || res.status}`);
  } else {
    console.log(`created ${s.email}  ->  ${body.id}`);
  }
}

console.log("\nDone. Now run supabase/migrations/003_promote_and_assign_sellers.sql");
