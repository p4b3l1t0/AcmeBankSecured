# AcmeBankSecured

## Project Overview

AcmeBankSecured is a basic web application that has been enhanced with security controls to protect against various vulnerabilities. This project aims to demonstrate secure coding practices and includes implementations of security features such as Helmet, CSRF protection, and secure file handling.

## Technologies Used

- Node.js
- SQLite3
- Express.js
- Helmet (for security headers)
- Express Validator
- Cookie Parser
- CSRF (Cross-Site Request Forgery) protection

## Project Structure

The project consists of the following main components:

- **Database**: AcmeBankSecured uses an SQLite3 database named `bank_sample.db` for user authentication and storing transaction data.

- **Web Server**: The web server is built using Node.js and Express.js. It serves the web application and handles user requests.

- **Security Features**:
  - **Helmet**: Security middleware for setting HTTP headers that enhance security.
  - **CSRF Protection**: Protects against Cross-Site Request Forgery attacks.
  - **Session Management**: Utilizes Express sessions for user authentication and security.
  - **File Handling**: Securely serves and manages user files, preventing path traversal vulnerabilities.
  - **XSS Prevention**: Implements measures to prevent Cross-Site Scripting vulnerabilities.
  - **SQL Injection Prevention**: Protects against SQL injection attacks.

## How to Run

1. Install Node.js and npm if not already installed. https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

3. Clone this repository to your local machine:

   ```git clone https://github.com/yourusername/AcmeBankSecured.git```

4. Navigate to the project directory:
  
    ```cd AcmeBankSecured```
  
5. Install project dependencies:

    ```npm install```
   
## Using Docker

You can use Docker to run this application in a container. Ensure you have Docker installed on your system.

1. Build a Docker image for the application and run it:

   ```docker build -t acmebanksecured .```

   ```docker run -p 3000:3000 -it acmebanksecured```
   
3. To stop the container you should get the Container ID, and execute the following commands:

   ```docker ps -as```
   ```docker stop <CONTAINER-ID>```
   
