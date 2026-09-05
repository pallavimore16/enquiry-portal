"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export async function signOut() {
  const db = await supabaseServer();
  await db.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/c");
}