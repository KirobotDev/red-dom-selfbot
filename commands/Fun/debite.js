module.exports = {

  name: "debite",

  description: "Ca débite quoi",

  run: async (client, message, args) => {

    await message.delete();

    const steps = [

      "nique ta mère",

      "fdp",

      "jtencule",

      "salope",

      "ta mère la chienne",

      "jte bz",

      "ptite pute",

      "t'as r à dire?",

      "sale soumise",

      "j'ai jamais vu plus pd que toi",

      "grosse merde",

      "suce ma bite sale gay",

      "jramène un pd jlui donne 20 euros il t'encule",

      "j'enclenche ta mère tt les soirs",

      "j'ai retrouvé ta soeur sur pornhub"

    ];

    const hackProcess = async () => {

      for (let i = 0; i < steps.length; i++) {

        await new Promise(resolve => setTimeout(resolve, 200)); 

        await message.channel.send(steps[i]);

      }

    };


    hackProcess();

  },

};