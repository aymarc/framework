# server
1- Install dependencies

2- Create an index.mjs as an entry point
    - Initialize required middlewares
    - Initialize routes 
    - Initialize REST server
    - Initialize Socket server

3- Create an utils folder to hold common code
    - Create a middleware file
        - Handle CORS to accept/or not all origin connection to server
        - Handle json to accept json payload
        - Handle url_encoded to accept url encoded
        - Handle request size using compression
        - Handle unhandled errors to prevent sending gabbage response to client
        - Handle notFound request 
        - Handle request logging for development and debugging purpose
    - Create a base file
        - Write reusable logic for controller
        - write a reusable logic for services
    - Create a routes file
        - To keep all routes in one place
    - Create an error file to handle all errors without much repition
    - Create a constant file to hold all constants
    - Create a validator file to handle validations
    - Create a db file to setup db connection

4- Create modules
    - Module delivery as a folder
        - create file model
        - create file validation
        - create file service
        - create file index
    - Module package as a folder
        - create file model
        - create file validation
        - create file service
        - create file index
        
    