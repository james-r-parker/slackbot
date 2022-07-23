export const onRequestPost: PagesFunction<{ TOKEN: string }> = async ({ env, request }) => {

    try {
        return new Response(null);
    }
    catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500 });
    }
}