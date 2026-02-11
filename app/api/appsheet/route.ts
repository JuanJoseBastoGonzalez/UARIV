const API_URL =
  "https://api.appsheet.com/api/v2/apps/a6401217-8537-47b2-bd5c-bbef3d515087/tables/Table%201/Action";
const API_KEY = "V2-u5e7d-LdN4H-ttZEx-A6ea4-BRY8z-6orsP-YHqgI-wCgK4";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("[v0] Proxy -> AppSheet:", JSON.stringify(body, null, 2));

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        applicationAccessKey: API_KEY,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log("[v0] AppSheet response status:", res.status);
    console.log("[v0] AppSheet response body:", text);

    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[v0] Proxy error:", error);
    return new Response(JSON.stringify({ error: "Error en el servidor proxy" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
