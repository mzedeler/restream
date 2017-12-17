const streams = {};

const add = (id, stream) => {
  if (!streams[id]) {
    streams[id] = stream;
  } else if (streams[id] !== stream) {
    throw new Error(`Another stream with this id already exists: ${id}`);
  } // else stream has been registered (streams[id] === stream)
};

module.exports = {
  streams,
  add,
};
