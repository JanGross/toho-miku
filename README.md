![miku-banner](https://github.com/JanGross/toho-miku/assets/13641301/70ae153f-5e1d-4f49-9793-659ac3631403)

[![](https://dcbadge.vercel.app/api/server/uWFpsYnbPX)](https://discord.gg/uWFpsYnbPX)  [![Support the project on Patreon](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.vercel.app%2Fapi%3Fusername%3Dtoho_miku%26type%3Dpatrons&style=for-the-badge)](https://patreon.com/toho_miku)

Part of this project are
- [Toho-Mon](https://github.com/JanGross/toho-mon) Bot status monitoring with webhook alerts
- [Toho-Reno](https://github.com/JanGross/toho-reno) Godot render node 
- [Job-Server](https://github.com/JanGross/job-server) Jobserver managing render jobs

### Run dev container

```bash
$ docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Sequelize migrations

```bash
$npx sequelize db:migrate
$npx sequelize db:seed:all
``` 

### API  
API docs can be found in [Docs/api/README.md](Docs/api/README.md)
