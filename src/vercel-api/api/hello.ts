export default {
  async fetch(request: Request) {
    return new Response("Hello world", { status: 200 });
  },
};
