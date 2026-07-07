const BEXIO_TOKEN_URL = Deno.env.get("BEXIO_TOKEN_URL") || "https://idp.bexio.com/token";

Deno.serve(async (request) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");

  if (error) {
    return htmlResponse("Bexio-Verbindung abgebrochen", `Bexio meldet: ${escapeHtml(error)}`, 400);
  }

  if (!code) {
    return htmlResponse("Kein OAuth-Code erhalten", "Der Bexio Callback enthielt keinen code-Parameter.", 400);
  }

  const clientId = Deno.env.get("BEXIO_CLIENT_ID");
  const clientSecret = Deno.env.get("BEXIO_CLIENT_SECRET");
  const redirectUri = Deno.env.get("BEXIO_REDIRECT_URI");

  if (!clientId || !clientSecret || !redirectUri) {
    return htmlResponse(
      "Bexio OAuth ist noch nicht konfiguriert",
      "Bitte BEXIO_CLIENT_ID, BEXIO_CLIENT_SECRET und BEXIO_REDIRECT_URI in Supabase Secrets hinterlegen.",
      500,
    );
  }

  try {
    const tokenResponse = await fetch(BEXIO_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenText = await tokenResponse.text();
    const tokenData = safeJson(tokenText) as Record<string, unknown>;

    if (!tokenResponse.ok) {
      return htmlResponse("Bexio Token konnte nicht erstellt werden", escapeHtml(tokenText), 500);
    }

    const accessToken = String(tokenData.access_token || "");
    const refreshToken = String(tokenData.refresh_token || "");
    const expiresIn = String(tokenData.expires_in || "");

    if (!accessToken) {
      return htmlResponse("Bexio Token fehlt", "Bexio hat keinen access_token zurückgegeben.", 500);
    }

    return new Response(successHtml(accessToken, refreshToken, expiresIn), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return htmlResponse("Bexio OAuth Fehler", escapeHtml(message), 500);
  }
});

function successHtml(accessToken: string, refreshToken: string, expiresIn: string) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <title>Bexio verbunden</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:#f8f7f3; color:#22231f; margin:0; padding:32px; }
      main { max-width: 860px; margin: 0 auto; background:#fff; border:1px solid #dedbd2; border-radius:8px; padding:24px; }
      h1 { margin-top:0; }
      code, pre { background:#f1f2ef; border:1px solid #dedbd2; border-radius:6px; }
      code { padding:2px 5px; }
      pre { padding:12px; overflow-x:auto; white-space:pre-wrap; word-break:break-all; }
      .warn { border-left:4px solid #b6945c; background:#faf8f2; padding:12px; border-radius:6px; }
    </style>
  </head>
  <body>
    <main>
      <h1>Bexio wurde verbunden</h1>
      <p class="warn">Diese Werte sind geheim. Nicht screenshotten, nicht in den Chat schicken und nicht in GitHub speichern.</p>
      <p>Trage die folgenden Secrets in Supabase ein:</p>
      <pre>BEXIO_ACCESS_TOKEN=${escapeHtml(accessToken)}
BEXIO_REFRESH_TOKEN=${escapeHtml(refreshToken)}
BEXIO_TOKEN_EXPIRES_IN=${escapeHtml(expiresIn)}</pre>
      <p>Danach kann die Function <code>bexio-invoice</code> den Token für Bexio verwenden.</p>
    </main>
  </body>
</html>`;
}

function htmlResponse(title: string, body: string, status = 200) {
  return new Response(
    `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${title}</h1><p>${body}</p></body></html>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
