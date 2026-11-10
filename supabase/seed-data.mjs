// supabase/seed-data.mjs — create sample projects and tasks.
// Run: node supabase/seed-data.mjs
// Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in env.

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  // Find the admin user to use as owner
  const { data: users } = await supabase.from("users").select("id, email, role").eq("role", "admin");
  const admin = users?.[0];
  if (!admin) {
    console.error("No admin user found. Run seed.mjs first.");
    process.exit(1);
  }

  // Find existing client or create one
  let { data: clients } = await supabase.from("clients").select("*").eq("owner_id", admin.id);
  let client = clients?.[0];

  if (!client) {
    const { data: created, error: clientErr } = await supabase
      .from("clients")
      .insert({ name: "Acme Corp", email: "client@example.com", company: "Acme Corporation", owner_id: admin.id })
      .select()
      .single();
    if (clientErr) throw clientErr;
    client = created;
    console.log(`Created client: ${client.name} (${client.id})`);
  } else {
    console.log(`Using existing client: ${client.name} (${client.id})`);
  }

  // Create projects
  const projectDefs = [
    { title: "Portfolio Website Redesign", description: "Complete overhaul of the client's portfolio website with modern design and improved performance.", status: "completed", client_id: client.id, owner_id: admin.id, visibility: "public" },
    { title: "E-commerce Platform", description: "Build a full-featured online store with payment processing and inventory management.", status: "active", client_id: client.id, owner_id: admin.id, visibility: "private" },
    { title: "Mobile App Development", description: "Native iOS and Android application for customer engagement.", status: "active", client_id: client.id, owner_id: admin.id, visibility: "private" },
    { title: "API Integration", description: "Third-party API integrations for CRM and analytics.", status: "on-hold", client_id: client.id, owner_id: admin.id, visibility: "private" },
    { title: "Legacy Migration", description: "Migrate legacy systems to cloud infrastructure.", status: "cancelled", client_id: client.id, owner_id: admin.id, visibility: "private" },
  ];

  // Clear existing projects/tasks for this client first
  const { data: existingProjects } = await supabase
    .from("projects")
    .select("id")
    .eq("client_id", client.id);

  if (existingProjects && existingProjects.length > 0) {
    const projectIds = existingProjects.map(p => p.id);
    await supabase.from("tasks").delete().in("project_id", projectIds);
    await supabase.from("projects").delete().in("id", projectIds);
  }

  const { data: projects, error: projErr } = await supabase
    .from("projects")
    .insert(projectDefs)
    .select();

  if (projErr) throw projErr;
  console.log(`Created ${projects?.length} projects`);

  // Create tasks for the first two projects
  const activeProject = projects?.find(p => p.status === "in-progress" || p.status === "active");
  const completedProject = projects?.find(p => p.status === "completed");

  const taskDefs = [];
  if (activeProject) {
    taskDefs.push(
      { project_id: activeProject.id, title: "Set up database schema", description: "Design and implement the database structure.", status: "done", priority: "high", assignee_ids: [admin.id], "order": 0 },
      { project_id: activeProject.id, title: "Build authentication flow", description: "Implement user login and registration.", status: "done", priority: "high", assignee_ids: [admin.id], "order": 1 },
      { project_id: activeProject.id, title: "Create product listing page", description: "Display all products with filtering and search.", status: "in-progress", priority: "medium", assignee_ids: [admin.id], "order": 2 },
      { project_id: activeProject.id, title: "Implement shopping cart", description: "Add cart functionality with local storage.", status: "todo", priority: "medium", assignee_ids: [admin.id], "order": 3 },
      { project_id: activeProject.id, title: "Set up payment gateway", description: "Integrate Stripe for checkout.", status: "todo", priority: "high", assignee_ids: [admin.id], "order": 4, due_date: "2026-12-15" },
      { project_id: activeProject.id, title: "Write unit tests", description: "Achieve 80% test coverage.", status: "todo", priority: "low", assignee_ids: [admin.id], "order": 5 },
    );
  }

  if (completedProject) {
    taskDefs.push(
      { project_id: completedProject.id, title: "Design system setup", description: "Create component library and design tokens.", status: "done", priority: "high", assignee_ids: [admin.id], "order": 0 },
      { project_id: completedProject.id, title: "Implement dark mode", description: "Add theme switching with CSS variables.", status: "done", priority: "medium", assignee_ids: [admin.id], "order": 1 },
      { project_id: completedProject.id, title: "SEO optimization", description: "Improve meta tags, sitemaps, and performance.", status: "done", priority: "medium", assignee_ids: [admin.id], "order": 2 },
      { project_id: completedProject.id, title: "Launch and deploy", description: "Deploy to production and verify everything works.", status: "done", priority: "high", assignee_ids: [admin.id], "order": 3 },
    );
  }

  if (taskDefs.length > 0) {
    const { data: tasks, error: taskErr } = await supabase.from("tasks").insert(taskDefs).select();
    if (taskErr) throw taskErr;
    console.log(`Created ${tasks?.length} tasks`);
  }

  console.log("\nSeed data complete!");
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});