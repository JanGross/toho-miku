# Band Bot

### Run dev container

```bash
$ docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Sequelize migrations

```bash
$npx sequelize db:migrate
$npx sequelize db:seed:all
``` 

### Import

Use `npm run import` to import from assets/import/{bands,characters}.
