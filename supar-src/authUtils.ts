import { supabase } from "./supabaseClient.ts";

export const getUserByAccessToken = async (accessToken: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("id,uuid,username,is_active,roles(role(name))")
    .eq("token", accessToken)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (data.length === 0) {
    return {};
  }

  return data;
};