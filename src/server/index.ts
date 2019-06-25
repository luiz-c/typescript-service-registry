import getPort from 'get-port';
import server from './server';
import Config from '../config';

const config = new Config('debug');

async function initialize () {
  const randomPort = await getPort({ port: getPort.makeRange(3000, 3100) });

  server.listen(randomPort, (err) => {
    if (err) {
      return config.log.error(err);
    }

    return config.log.info(`Server is listening on port ${randomPort}`);
  });
}

initialize();
