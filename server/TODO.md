# Server

1. [x] Install dependencies

2. Create an `index.mjs` as an entry point
    - [ ] Initialize required middlewares
    - [ ] Initialize routes
    - [ ] Initialize REST server
    - [ ] Initialize Socket server

3. Create a `utils` folder to hold common code
    - Create a `middleware` file
        - [x] Handle CORS to accept or reject all origin connections to the server
        - [x] Handle JSON to accept JSON payloads
        - [x] Handle URL-encoded to accept URL-encoded payloads
        - [x] Handle request size using compression
        - [x] Handle unhandled errors to prevent sending garbage responses to clients
        - [x] Handle not found requests
        - [ ] Handle request logging for development and debugging purposes
    - Create a `base` file
        - [ ] Write reusable logic for controllers
        - [ ] Write reusable logic for services
    - Create a `routes` file
        - [ ] Keep all routes in one place
    - [ ] Create an `error` file to handle all errors without much repetition
    - [ ] Create a `constants` file to hold all constants
    - [ ] Create a `validator` file to handle validations
    - [ ] Create a `db` file to set up the database connection

4. Create modules
    - Module `delivery` as a folder
        - [ ] Create `model` file
        - [ ] Create `validation` file
        - [ ] Create `service` file
        - [ ] Create `index` file
    - Module `package` as a folder
        - [ ] Create `model` file
        - [ ] Create `validation` file
        - [ ] Create `service` file
        - [ ] Create `index` file
