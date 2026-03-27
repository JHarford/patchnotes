import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token || !verifyAdminToken(token)) {
    return <AdminLogin />;
  }

  // Fetch all newsletters
  const { data: newsletters } = await supabase
    .from("newsletters")
    .select(
      "id, title, subject, status, created_at, sent_at, total_recipients, body_json"
    )
    .order("created_at", { ascending: false });

  // Fetch delivery stats for sent newsletters
  const sentIds = (newsletters || [])
    .filter((n) => n.status === "sent")
    .map((n) => n.id);

  const stats: Record<string, { sent: number; failed: number; total: number }> =
    {};

  if (sentIds.length > 0) {
    const { data: recipients } = await supabase
      .from("newsletter_recipients")
      .select("newsletter_id, status")
      .in("newsletter_id", sentIds);

    for (const r of recipients || []) {
      if (!stats[r.newsletter_id]) {
        stats[r.newsletter_id] = { sent: 0, failed: 0, total: 0 };
      }
      stats[r.newsletter_id].total++;
      if (r.status === "sent") stats[r.newsletter_id].sent++;
      else stats[r.newsletter_id].failed++;
    }
  }

  // Subscriber count
  const { count } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  return (
    <AdminDashboard
      newsletters={newsletters || []}
      stats={stats}
      subscriberCount={count || 0}
    />
  );
}
