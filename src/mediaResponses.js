const fs = require('fs');
const path = require('path');

const streamFile = (filePath, req, res, type) => {
  const file = path.resolve(__dirname, filePath);

  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
      }
      return res.end(err);
    }

    let { range } = req.headers;
    if (!range) range = 'bytes=0-';

    const positions = range.replace(/bytes=/, '').split('-');
    let start = parseInt(positions[0], 10);

    const total = stats.size;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    if (start > end) start = end - 1;

    const chunkSize = (end - start) + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': type,
    });

    const stream = fs.createReadStream(file, { start, end });

    stream.on('open', () => {
      stream.pipe(res);
    });

    stream.on('error', (streamErr) => {
      res.end(streamErr);
    });

    return stream;
  });
};

const getParty = (req, res) => {
  streamFile('../client/party.mp4', req, res, 'video/mp4');
};

const getBling = (req, res) => {
  streamFile('../client/bling.mp3', req, res, 'audio/mpeg');
};

const getBird = (req, res) => {
  streamFile('../client/bird.mp4', req, res, 'video/mp4');
};

module.exports = {
  getParty,
  getBling,
  getBird,
};
