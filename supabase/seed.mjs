// supabase/seed.mjs — one-time setup: admin + sample client users.
// Run:  node supabase/seed.mjs
// Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
//           in the environment or a .env file loaded by dotenv.
//
// Uses the Admin API so users are created WITHOUT email confirmation — the admin
// can log in immediately. The auth-user trigger creates each profile with
// role='client'; this script promotes the owner to 'admin' afterwards.

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_EMAIL = "admin@jhed.dev",
  ADMIN_PASSWORD,
  CLIENT_EMAIL = "client@example.com",
  CLIENT_PASSWORD = "client-demo-2026",
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!ADMIN_PASSWORD) {
  console.error("Missing ADMIN_PASSWORD (set it in .env.local)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function upsertUser(email, password, role, clientId) {
  // 1. Create the auth user (Admin API — no email confirmation).
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip confirmation so they can log in right away
  });
  if (createErr && !createErr.message?.already registered) {
    throw createErr;
  }
  const userId = created?.user?.id;
  if (!userId) {
    const { data: existing, error: getErr } = await supabase.auth.admin.getUserByEmail(email);
    if (getErr || !existing?.user) throw getErr ?? new Error("could not resolve user");
    userId = existing.user.id;
  }

  // 2. The trigger created a profile with role='client'. Promote it.
  const { error: updateErr } = await supabase
    .from("users")
    .update({ role, client_id: clientId })
    .eq("id", userId);
  if (updateErr) throw updateErr;

  return userId;
}

async function main() {
  // 1. Admin
  const adminId = await upsertUser(ADMIN_EMAIL, ADMIN_PASSWORD, "admin", null);
  console.log(`admin user: ${adminId} (${ADMIN_EMAIL})`);

  // 2. Sample client + client-role user linked to it
  const { data: clientRow, error: clientErr } = await supabase
    .from("clients")
    .upsert(
      { name: "Acme Corp", email: CLIENT_EMAIL, company: "Acme Corporation", owner_id: adminId },
      { onConflict: "email" },
    )
    .select()
    .single();
  if (clientErr) throw clientErr;
  console.log(`client record: ${clientRow.id} (${clientRow.name})`);

  const clientId = await upsertUser(CLIENT_EMAIL, CLIENT_PASSWORD, "client", clientRow.id);
  console.log(`client user: ${clientId} (${CLIENT_EMAIL})`);

  console.log("\nSeed complete. Login with:");
  console.log(`  admin  → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  client → ${CLIENT_EMAIL} / ${CLIENT_PASSWORD}`);
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});