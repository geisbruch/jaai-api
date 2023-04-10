#!/bin/sh
TEST_PG_CMD=$(echo "PGPASSWORD=$DB_PASSWORD psql -h $DB_HOSTNAME -p $DB_PORT -U postgres -c 'select 1'")

eval $TEST_PG_CMD
while [ $? -ne 0 ]; do
  echo "Checking postgres";
  sleep 1;
  eval $TEST_PG_CMD
done;

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOSTNAME -p $DB_PORT -U postgres -c "CREATE DATABASE $DB_NAME;"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOSTNAME -p $DB_PORT -U postgres -c "CREATE SCHEMA IF NOT EXISTS $DB_SCHEMA" $DB_NAME
npm run start-local
