# Toho Miku

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