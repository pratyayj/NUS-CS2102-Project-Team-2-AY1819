# CS2102-Team-2
NUS CS2102 Team 2 Project

Ensure you are in the right directory. To know you are in the right directory, you should see the SQL file and the App folder.

# Setting up Database
Run the following commands to set up the database correctly
```
psql -U <postgres_role>
CREATE DATABASE restaurant_app;
\c restaurant_app
\i schema.sql
\i mock_data_generation.sql
```
Note: File location are relative, so ensure you are at the right location.

# Modify .env file
File is located inside the App folder. This is basically the configuration for connection to the database.
Format: DATABASE_URL=postgres://postgres:<username>@<host_identifier>:<port_number>/restaurant_app
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/cs2102
```

# Run web server:
Next, run the following set of commands relative from the home directory
```
cd App
npm install
node bin /www
```
