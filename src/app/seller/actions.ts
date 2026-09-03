"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function decide(formData: FormData) {
  const id = Number(formData.get("id"));
  const db = await supabaseServer();

  const { error } = await db.rpc("decide_enquiry", {
    p_enquiry_id: id,
    p_decision: String(formData.get("decision")),
    p_note: String(formData.get("note") ?? "") || null,
  });

  // On failure, send them back to the same page with the message in the URL.
  if (error) {
    redirect(`/seller/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/seller");
  revalidatePath(`/seller/${id}`);
  redirect("/seller");
}