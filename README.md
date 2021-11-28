# Cafco Register Management
This web application is designed and developed to manage online courses registration for cafco institution. It also contains APIs for CafcoWorkshop Mobile application.

# Requirements
To run the server, we need `NodeJS` and `mongodb`. To install these tools follow the instruction bellow. You can run the server on any platforms, such as **Windows**, **Linux** or **MacOS**.
  
  * installing on **Windows** or **Mac OS**:
    1. Download and install **Nodejs** from (here)[https://nodejs.org/en/download/].
    2. Download and install **MongoDB Compass** from (here)[https://www.mongodb.com/products/compass].
  
  * installing on **Linux**:
    1. To install **Nodejs** run the commands bellow in a terminal.
    ```
    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    sudo apt install nodejs
    ```
    2. To install **MongoDB** run the commands bellow.
    ```
    sudo apt-get install gnupg
    wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo apt-get install -y mongodb
    ```

# Download Project
You can clone this repository using `git` or (GitHub Desktop)[https://desktop.github.com/]


