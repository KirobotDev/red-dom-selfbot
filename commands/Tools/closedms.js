module.exports = {
    name: "closedms",
    description: "Close all your dms",
    run: async (client, message, args) => {
        client.channels.cache.filter((channel) => channel.type === "DM").map((channel) => channel.delete().catch(() => false))
        message.edit("Tout les dm ont été close")
    }
}