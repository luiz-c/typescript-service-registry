import * as semver from 'semver';
import Config from '../../config';
import MemcachePlus from 'memcache-plus';

class ServiceRegistry {
  private log;
  private readonly SERVICES_KEY = 'services';

  private memcached;

  constructor (log) {

    this.log = log;

    this.memcached = new MemcachePlus(Config.memcachedServers);
  }

  async get (name: string, version: string): Promise<Object> {
    let services = await this.getMemcachedServices();
    services = this.cleanup(services);

    const candidates = Object.values(services)
      .filter((service: any) => service.name === name && semver.satisfies(service.version, version));
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  async register (name: string, version: string, ip: string, port: string): Promise<string> {
    const key = name + version + ip + port;
    let action = 'Updated';

    let services = await this.getMemcachedServices();

    if (!services[key]) {
      services[key] = {};
      services[key].ip = ip;
      services[key].port = port;
      services[key].name = name;
      services[key].version = version;
      action = 'Added';
    }

    services[key].timestamp = Math.floor(new Date().getTime() / 1000);

    await this.saveToMemcached(services);

    this.log.debug(`${action} service ${name}, version ${version} at ${ip}:${port}`);
    
    return key;
  }

  async unregister (name: string, version: string, ip: string, port: string): Promise<string> {
    const key = name + version + ip + port;
    let services = await this.getMemcachedServices();
    delete services[key];
    await this.saveToMemcached(services);
    this.log.debug(`Unregistered services ${name}, version ${version} at ${ip}:${port}`);
    return key;
  }

  async getMemcachedServices(): Promise<Object> {
    let services = await this.memcached.get(this.SERVICES_KEY);
    if (services) {
      services = JSON.parse(services);
    } else {
      services = {};
    }
    return services;
  }

  async saveToMemcached(services: Object): Promise<string> {
    return this.memcached.set(this.SERVICES_KEY, JSON.stringify(services), Config.serviceTimeout);
  }

  cleanup(services) {
    const now = Math.floor(new Date().getTime() / 1000);
    Object.keys(services).forEach((key) => {
      if (services[key].timestamp + Config.serviceTimeout < now) {
        delete services[key];
        this.log.debug(`Removed service ${key}`);
      }
   });

   this.saveToMemcached(services);

   return services;
  }

}

export default ServiceRegistry;
