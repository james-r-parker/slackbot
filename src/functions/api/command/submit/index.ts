export const onRequestPost: PagesFunction<{ TOKEN: string }> = async ({ env, request }) => {

    try {

        const body = await request.text();
        const params = new URLSearchParams(body);
        const json = params.get("payload");

        if (json) {
            const payload = JSON.parse(json);
            const user = payload.user.username;
            if (payload.type === "view_submission") {
                const id = payload.view.callback_id;
                const meta = JSON.parse(payload.view.private_metadata);
                const state = payload.view.state.value;
                if (meta.meta.verify && meta.meta.channel) {
                    await fetch('https://slack.com/api/chat.postMessage',
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json;charset=UTF8"
                            },
                            body: JSON.stringify({
                                channel: "C4QB62S86",
                                blocks: [
                                    {
                                        type: "section",
                                        text: {
                                            type: "mrkdwn",
                                            text: `@${user} ran the ${meta.command} command with the options \`${JSON.stringify(state)}\``
                                        }
                                    },
                                    {
                                        type: "actions",
                                        elements: [
                                            {
                                                type: "button",
                                                action_id: "yes",
                                                style: "primary",
                                                value: JSON.stringify({ meta: meta, values: state, user: payload.user }),
                                                text: {
                                                    type: "plain_text",
                                                    text: "Yes",
                                                    emoji: true
                                                }
                                            },
                                            {
                                                type: "button",
                                                action_id: "no",
                                                style: "danger",
                                                value: JSON.stringify({ meta: meta, values: state, user: payload.user }),
                                                text: {
                                                    type: "plain_text",
                                                    text: "No",
                                                    emoji: true
                                                }
                                            }
                                        ]
                                    }
                                ]
                            })
                        })
                }
                console.log(id, meta);
            }
            else if (payload.type === "block_actions") {
                let message = ""
                if (payload.actions[0].action_id === "yes") {
                    message = `@${user} accepted the request \`${payload.actions[0].value}\``
                }
                else {
                    message = `@${user} denied the request \`${payload.actions[0].value}\``
                }

                await fetch(payload.response_url, {
                    method: "POST",
                    body: JSON.stringify({
                        replace_original: "true",
                        text: message
                    })
                });
            }
        }

        return new Response(null);
    }
    catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500 });
    }
}