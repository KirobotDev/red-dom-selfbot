module.exports = {
    name: "link",
    description: "send you add link",
    run: async (client, message, args) => {
      try{
        message.edit(`https://discord.gg/${(await client.user.createFriendInvite()).code}`)
      }
      catch(e){console.log(e)}
    }
  }