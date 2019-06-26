# base-service-registry

This is just a base [NodeJS](https://nodejs.org/en/) service registry project using [TypeScript](https://www.typescriptlang.org/)

##### This branch uses Memcached storage.

To run a Memcached instance you can start a local docker instance running:

```bash
docker-compose -f memcached-compose.yml up -d
```

To stop and remove this Memcached instance run:
```bash
docker-compose -f memcached-compose.yml down
```

It's necessary to configure the `memcachedServers` variable in `config/index.ts` if you changed the Memcached config/cluster

## Installation

Use node package manager [npm](https://www.npmjs.com/) to install dependencies.

```bash
npm install
```

## Usage

#### Execute the development mode, it'll watch for any changes in the `*.ts` files
```bash
npm run dev
```

#### Execute the tests in `*.spec.ts` files
```bash
npm run test
```

#### Execute the pre-configured lint
```bash
npm run lint
```

#### Execute the pre-configured lint common fixes
```bash
npm run lint-fix
```

#### Build the application
```bash
npm run build
```

## License
[MIT](https://choosealicense.com/licenses/mit/)