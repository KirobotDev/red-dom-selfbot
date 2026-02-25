module.exports = {
    name: 'purge',

    run: async (message) => {
        try { 
            const messagevide = "\u200b\n".repeat(50);  

            await message.delete() 
            await message.channel.send(messagevide);
 
            for (let i = 0; i < 10; i++) {
                await message.channel.send(messagevide);  
            }
        } catch (error) {
            console.error(error);
        }
    }
};
