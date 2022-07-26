const encoder = new TextEncoder();


const verifyRequest = async (body: string, headers: Headers, secret: string): Promise<boolean> => {

    if (!secret) {
        console.error("NO SECRET");
        return false;
    }

    const timestamp = headers.get('X-Slack-Request-Timestamp');
    if (!timestamp) {
        console.error("NO TIMESTAMP");
        return false;
    }

    const sig = headers.get('X-Slack-Signature');
    if (!sig) {
        console.error("NO SIGNATURE");
        return false;
    }

    const matches = sig.match(/[\da-f]{2}/gi);
    if (!matches) {
        return false;
    }

    const base = 'v0:' + timestamp + ':' + body;

    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    );

    const data = new Uint8Array(matches.map((h) => {
        return parseInt(h, 16)
    }))

    const verified = await crypto.subtle.verify(
        'HMAC',
        key,
        data,
        encoder.encode(base)
    )

    return verified;
}

export const validateRequest: PagesFunction<{ SECRET: string }> = async ({ env, request, next }) => {

    try {

        const body = await request.text();

        if (!await verifyRequest(body, request.headers, env.SECRET)) {
            return new Response("Bad Request", { status: 400 });
        }

        console.log("VALIDATED");

        return await next();
    }
    catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500 });
    }
}

export const onRequest = [validateRequest];