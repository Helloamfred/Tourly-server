# You can change this to a newer version of MySQL available at
# https://hub.docker.com/r/mysql/mysql-server/tags/
FROM mysql/mysql-server:8.0.24

COPY config/user.cnf /etc/mysql/my.cnf

FROM node:18.16.0

WORKDIR /

COPY package*.json .

RUN npm install

COPY . .


# Start command
CMD ["npm", "run", "server"]