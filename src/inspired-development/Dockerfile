# INSTALL 
FROM wtemp.cem:8445/oracle-container-master:1
#ARG CODE_REGISTRY
#FROM ${CODE_REGISTRY}/oracle-container-master:1
ENV TZ=America/Bogota
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
RUN cd /usr/src/app && npm install  
COPY . .
ENV WEB_PORT 3000
EXPOSE  3000
CMD [ "npm", "start" ]