import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/socratic-question`;

Deno.test("socratic-question: returns 401 without auth header", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phaseId: "test",
      phaseName: "Test Phase",
      phaseInstruction: "Test instruction",
      coreBelief: "Test belief",
      profile: "A",
      profileName: "Cognitivo",
      emotions: ["ansiedad"],
      triggers: ["estrés"],
      origin: "infancia",
      intensity: 7,
      previousAnswers: [],
    }),
  });

  assertEquals(response.status, 401);
  const data = await response.json();
  assertEquals(data.error, "Unauthorized");
});

Deno.test("socratic-question: returns 401 with invalid token", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer invalid_token_here",
    },
    body: JSON.stringify({
      phaseId: "test",
      phaseName: "Test Phase",
      phaseInstruction: "Test instruction",
      coreBelief: "Test belief",
      profile: "A",
      profileName: "Cognitivo",
      emotions: ["ansiedad"],
      triggers: ["estrés"],
      origin: "infancia",
      intensity: 7,
      previousAnswers: [],
    }),
  });

  assertEquals(response.status, 401);
  const data = await response.json();
  assertEquals(data.error, "Invalid token");
});

Deno.test("socratic-question: handles CORS preflight", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
  });

  assertEquals(response.status, 200);
  assertExists(response.headers.get("Access-Control-Allow-Origin"));
  assertExists(response.headers.get("Access-Control-Allow-Headers"));
  await response.text(); // Consume body
});
