
#alias st := start


# environment 
APP_NAME:= "server"

set dotenv-required := true
set dotenv-load := true
set dotenv-path := "./.env"
set export :=true

default:
    just --list 
    
start:
    docker compose up -d  && just logs

stop:
    docker compose down
    
kill:
    docker compose down -v 

restart:
    docker compose down
    docker compose up 
    just logs server
    
[doc("see the application log")]
logs:
    docker compose logs -f server


migrate name:
    npm run typeorm migration:create "src/migrations/{{name}}"

run-migrations:
    npm run typeorm migration:run -d src/datasource.ts

