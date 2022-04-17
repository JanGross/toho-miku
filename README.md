# Band Bot

### Run dev container

```bash
$ docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Sequelize migrations

If ran outside the container, DB_HOST must be set to localhost or the container's IP address.

```bash
$npx sequelize db:migrate
``` 
