<!-- NOTE: modify this file based on your project specifications-->
# CSP2 Demo App Overview:
### E-COMMERCE API DOCUMENTATION

**Installation:**

```npm install```

**User Credentials:**
- Admin User:
    - email: admin@mail.com
    - pwd: admin123
- Dummy Customer:
     - email: user@mail.com
     - pwd: user123
    

**ROUTES:**

***User Resource***
- User registration (POST)
	- /users/login
    - auth token required: NO
    - request body: 
        - email (string)
        - password (string)
        - firstName (string)
- User authentication (POST)
	- /users
    - auth token required: NO
    - request body: 
        - email (string)
        - password (string)
        

***Product Resource***
- Create Product (Admin only) (POST)
	- /products/create
    - auth token required: YES
    - request body: 
        - name (string)
        - description (string)
        - price (number)
- Retrieve all products (Admin only) (GET)
	- /products/all
    - auth token required: YES
    - request body: none
- Retrieve all active products (GET)
	- /products
    - auth header required: NO
	- request body: none

<!-- Add the rest of your routes here -->