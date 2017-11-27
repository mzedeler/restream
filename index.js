const restream = require('./restream');

module.exports = {
  actionTypes: {
    restream: restream.actionTypes,
  },
  actions: dispatch => ({
    restream: restream.actions(dispatch),
  }),
};
