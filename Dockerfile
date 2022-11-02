FROM node

FROM mongodb

WORKDIR /rbac

COPY package.json /rbac/

RUN npm cache clean --force

RUN npm install

COPY . /rbac/

EXPOSE 8081

CMD ["npm","start"]