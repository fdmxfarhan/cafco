## Cafco Register Management
This web application is designed and developed to manage online courses registration for cafco institution. It also contains APIs for CafcoWorkshop Mobile application.

# Requirements
To run the server, we need `NodeJS` and `mongodb`. To install these tools follow the instruction bellow. You can run the server on any platforms, such as **Windows**, **Linux** or **MacOS**. You can use Visual Studio Code (VS Code) as an editor and download it from [here](https://code.visualstudio.com/download).
  
  * installing on **Windows** or **Mac OS**:
    1. Download and install **Nodejs** from [here](https://nodejs.org/en/download/).
    2. Download and install **MongoDB Compass** from [here](https://www.mongodb.com/products/compass).
  
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
You can clone this repository using `git` or [GitHub Desktop](https://desktop.github.com/) manually click [here](https://github.com/fdmxfarhan/cafco/archive/refs/heads/main.zip) to download this project. If you are using **Linux** run this commands in a terminal.
```
cd ~
git clone https://github.com/fdmxfarhan/cafco.git
cd cafco
npm i
```

# Run Server
To run the server you can use the command bellow in a terminal. if you are using mac or windows you can use VSCode terminal as well (press `ctrl + j`). To stop server you can easily press `ctrl + c` in the terminal. This command must show to logs. First is that the server is running and seccond log is for database connection. after running this command, the server is started and now you can go to your browser and navigate to http://localhost:3000/ 
```
node index.js
```

# Code Structure
Inside the project directory there are folders wich contains each part of the application. The codes inside these folders are explained bellow.
  * **views:** this folder contains view files which are written in `jade` template. jade is similar to HTML but with diffrent syntax and with more options.
  * **routes:** this folder contains routing files wich are written in JS language. routes are the path after the domain for example in cofco.ir/dashboard as an example '/dashboard' is a route.
  * **public:** this folder is where all public files are placed. It contains images, fonts, css files, js files and etc.
  * **config:** this folder contains javascript functions for special use like date conversion, sms verification or authentications.
  * **models:** this folder contains database modles and schemas. [more info...](https://docs.mongodb.com/manual/data-modeling/)
  * **node_modules:** all the nodejs packages are placed here. Theres no need to change anything in this folder.
  * **ssl:** ssl certificate and private key are placed here.
  
