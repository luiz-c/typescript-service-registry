import express from 'express';
import ServiceRegistry from './lib/ServiceRegistry';
import Config from '../config';

class Server {
  public express;

  private config: Config;

  private serviceRegistry: ServiceRegistry;

  constructor () {
    this.express = express();

    if (this.express.get('env') === 'development') {
      this.config = new Config('debug');
      this.express.use((req, res, next) => {
        this.config.log.info(`${req.method}: ${req.url}`);
        return next();
      });
    } else if (this.express.get('env') === 'test') {
      this.config = new Config('fatal');
    } else {
      this.config = new Config('info');
    }

    this.serviceRegistry = new ServiceRegistry(this.config.log);
    this.mountRoutes();
  }

  private mountRoutes (): void {
    const router = express.Router();
    // eslint-disable-next-line no-unused-vars
    router.use((error, req, res, next) => {
      res.status(error.status || 500);
      // Log out the error to the console
      this.config.log.error(error);
      return res.json({
        error: {
          message: error.message,
        },
      });
    });

    router.put('/register/:name/:version/:port', (req, res) => {
      const { name, version, port } = req.params;

      const serviceip = req.connection.remoteAddress
        .includes('::') ? `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;

      const serviceKey = this.serviceRegistry.register(name, version, serviceip, port);

      return res.json({ result: serviceKey });
    });

    router.delete('/register/:name/:version/:port', (req, res) => {
      const { name, version, port } = req.params;

      const serviceip = req.connection.remoteAddress
        .includes('::') ? `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;

      const serviceKey = this.serviceRegistry.unregister(name, version, serviceip, port);

      return res.json({ result: serviceKey });
    });

    router.get('/find/:name/:version', (req, res) => {
      const { name, version } = req.params;
      const svc = this.serviceRegistry.get(name, version);
      if (!svc) {
        return res.status(404).json({ result: 'Service not found' });
      }
      return res.json(svc);
    });

    this.express.use('/', router);
  }
}

export default new Server().express;
