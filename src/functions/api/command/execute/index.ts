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

export const onRequestPost: PagesFunction<{ SLACKBOT: KVNamespace, SECRET: string, TOKEN: string }> = async ({ params, env, request }) => {

    try {

        const body = await request.text();

        if (!await verifyRequest(body, request.headers, env.SECRET)) {
            return new Response("Bad Request", { status: 400 });
        }

        const params = new URLSearchParams(body)
        console.log(params.get("text"));

        const payload = {
            "trigger_id": params.get("trigger_id"),
            "view": {
                "type": "modal",
                "callback_id": "modal-identifier",
                "title": {
                    "type": "plain_text",
                    "text": "Just a modal"
                },
                "blocks": [
                    {
                        "type": "section",
                        "block_id": "section-identifier",
                        "text": {
                            "type": "mrkdwn",
                            "text": "*Welcome* to ~my~ Block Kit _modal_!"
                        },
                        "accessory": {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Just a button"
                            },
                            "action_id": "button-identifier"
                        }
                    }
                ]
            }
        };

        console.log("Payload", payload);

        const response = await fetch("https://slack.com/api/views.open", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=UTF8",
                "Authorization": `Bearer ${env.TOKEN}`
            },
            body: JSON.stringify(payload)
        });

        console.log("RESPONSE", response.status, await response.text());

        return new Response(null);
    }
    catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500 });
    }
}