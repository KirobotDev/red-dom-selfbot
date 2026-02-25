let previousPermissions = {};

module.exports = {
  getPermissions: (channelId) => previousPermissions[channelId],
  setPermissions: (channelId, permissions) => {
    previousPermissions[channelId] = permissions;
  }
};
