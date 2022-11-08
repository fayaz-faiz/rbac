FROM node

WORKDIR /rbac

COPY package.json /rbac/

RUN npm cache clean --force

RUN echo 'deb http://deb.debian.org/debian jessie-backports main' > /etc/apt/sources.list.d/jessie-backports.list && \
     apt-get update && \
     apt-get install -y -t jessie-backports openjdk-8-jre-headless ca-certificates-java

RUN npm install

COPY . /rbac/

EXPOSE 8081

CMD ["npm","start"]
