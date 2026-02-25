const fs = require('fs'); 

module.exports = {
  name: "fuck",
  description: "La meilleure commande",
  run: async (client, message, args) => {
    const sltcv = [
      ":point_right:   :ok_hand:",
      ":point_right:  :ok_hand:",
      ":point_right: :ok_hand:",
      ":point_right::ok_hand:",
      ":point_right:  :ok_hand:",
      ":point_right:   :ok_hand:",
      ":point_right:    :ok_hand:",
      ":point_right:   :ok_hand:",
      ":point_right:  :ok_hand:",
      ":point_right: :ok_hand:",
      ":point_right::ok_hand:",
      ":point_right:  :ok_hand:",
      ":point_right:   :ok_hand:",
      ":point_right:    :ok_hand:",
      ":point_right:   :ok_hand:",
      ":point_right:  :ok_hand:",
      ":point_right: :ok_hand:",
      ":point_right::ok_hand:"
    ];

    sltcv.forEach(c => message.edit(c).catch(() => false));
  }
};
