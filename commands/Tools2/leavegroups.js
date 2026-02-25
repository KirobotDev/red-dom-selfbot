module.exports = {
    name: "leavegroups",
    description: "Leave all your groups",
    run: async (client, message, args) => {
        client.channels.cache.filter((channel) => channel.type === "GROUP_DM").map((channel) => channel.delete().catch(() => false))
        message.edit("Tout les groupes ont été quittés")
    }
}