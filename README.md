# Run.go

- [Description](#description)
- [Getting Started](#getting-started)
  - [Dependencies](#dependencies)
  - [Installing](#installing)
  - [Executing program](#executing-program)
- [Documentation](#documentation)
- [Help](#help)
- [Authors](#authors)
- [Version History](#version-history)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Description

Run.go backend on NestJs

## Getting Started

### Dependencies

To get started, ensure the following dependencies are installed on the traget
device.

- [Just](https://just.systems)
- [NodeJs](https://nodejs.org)
- [Docker](https://docker.com)
- [Docker compose](https://docs.docker.com/compose/)

### Installing

For the application's initial setup, run the following command.

```sh
git clone https://github.com/DavetOluwapelumi/RunGo_backend backend
cd backend 
cp .env.template .env
just start
```

### Executing program

For subsequent run execute

```sh
just start
```

## Documentation

1. Create migration

```sh
npm run migration:create --name=<migration-title>
```

2. Revert migration

```sh
npm run migration:revert
```

## Help

See documentation

- [TypeORM migration guide](https://github.com/typeorm/typeorm/blob/master/docs/migrations.md)
- [Typeorm](https://typeorm.io)
- [NestJs](https://nestjs.com)
- [API documentation](https://documenter.getpostman.com/view/18058225/2sAYdhHpNK)
- [Email sandbox](https://ethereal.email), see the [.env.example](.env.example)
  for th credentials
