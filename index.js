const stream = require('./stream');

module.exports = {
  actionTypes: {
    stream: stream.actionTypes,
  },
  actions: dispatch => ({
    stream: stream.actions(dispatch),
  }),
};
