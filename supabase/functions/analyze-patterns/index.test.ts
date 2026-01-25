import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/analyze-patterns`;

Deno.test("analyze-patterns: returns 401 without auth header", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      journalEntries: [
        { id: "1", mood_score: 7, emotions: ["feliz"], triggers: [], notes: null, energy_level: 7, sleep_quality: 8, created_at: new Date().toISOString() },
        { id: "2", mood_score: 5, emotions: ["neutral"], triggers: [], notes: null, energy_level: 5, sleep_quality: 6, created_at: new Date().toISOString() },
        { id: "3", mood_score: 4, emotions: ["triste"], triggers: ["trabajo"], notes: null, energy_level: 4, sleep_quality: 5, created_at: new Date().toISOString() },
      ],
    }),
  });

  assertEquals(response.status, 401);
  const data = await response.json();
  assertEquals(data.error, "Unauthorized");
});

Deno.test("analyze-patterns: returns 401 with invalid token", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer not_a_real_token",
    },
    body: JSON.stringify({
      journalEntries: [
        { id: "1", mood_score: 7, emotions: ["feliz"], triggers: [], notes: null, energy_level: 7, sleep_quality: 8, created_at: new Date().toISOString() },
        { id: "2", mood_score: 5, emotions: ["neutral"], triggers: [], notes: null, energy_level: 5, sleep_quality: 6, created_at: new Date().toISOString() },
        { id: "3", mood_score: 4, emotions: ["triste"], triggers: ["trabajo"], notes: null, energy_level: 4, sleep_quality: 5, created_at: new Date().toISOString() },
      ],
    }),
  });

  assertEquals(response.status, 401);
  const data = await response.json();
  assertEquals(data.error, "Invalid token");
});

Deno.test("analyze-patterns: handles CORS preflight", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
  });

  assertEquals(response.status, 200);
  assertExists(response.headers.get("Access-Control-Allow-Origin"));
  assertExists(response.headers.get("Access-Control-Allow-Headers"));
  await response.text(); // Consume body
});
