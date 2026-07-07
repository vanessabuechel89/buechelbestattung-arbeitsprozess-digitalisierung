const BEXIO_AUTH_URL = Deno.env.get("BEXIO_AUTH_URL") || "https://idp.bexio.com/authorize";

Deno.serve((_request) => {
  const clientId = Deno.env.get("BEXIO_CLIENT_ID");
  const redirectUri = Deno.env.get("BEXIO_REDIRECT_URI");
  const scope = Deno.env.get("BEXIO_OAUTH_SCOPE") || "offline_access";
  const state = crypto.randomUUID();

  if (!clientId || !redirectUri) {
    return htmlResponse(
      "Bexio OAuth ist noch nicht konfiguriert.",
      "Bitte BEXIO_CLIENT_ID und BEXIO_REDIRECT_URI in Supabase Secrets hinterlegen.",
      500,
    );
  }

  const url = new URL(BEXIO_AUTH_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);

  return Response.redirect(url.toString(), 302);
});

function htmlResponse(title: string, body: string, status = 200) {
  return new Response(
    `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${title}</h1><p>${body}</p></body></html>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}
