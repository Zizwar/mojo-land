import { supabase } from "./supabaseClient.ts";

export const logError = async ({
  status = "none",
  module = "mojo",
  action = "error",
  error,
  log = "",
}: {
  status?: string;
  module?: string;
  action?: string;
  error: any;
  log?: string;
}) => {
  try {
    const { error: logError } = await supabase
      .from("logs")
      .insert({ status, module, action, error: JSON.stringify(error), log });

    if (logError) {
      throw logError;
    }
  } catch (error) {
    throw error;
  }
};