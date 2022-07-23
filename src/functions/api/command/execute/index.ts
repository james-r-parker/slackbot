export const onRequestPost: PagesFunction<{ SLACKBOT: KVNamespace, TOKEN: string }> = async ({ env, request }) => {

    try {

        const body = await request.text();
        const params = new URLSearchParams(body);
        const command = params.get("text");

        if (command) {
            const parts = command.split(" ");
            const modal = await env.SLACKBOT.get(parts[0]);
            if (modal) {
                const record = JSON.parse(modal);
                const payload = { trigger_id: params.get("trigger_id"), view: { ...record.modal, callback_id: `form_${parts[0]}`, private_metadata: JSON.stringify({ command: command, meta: record.meta }) } }
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
        }

        return new Response("Unknown command");
    }
    catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500 });
    }
}