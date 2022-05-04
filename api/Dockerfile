FROM node:12-alpine
# Adding build tools to make yarn install work on Apple silicon / arm64 machines
RUN apk add --no-cache python2 g++ make
WORKDIR /app
COPY . .
RUN yarn install --production
EXPOSE 80
ENV MQTT_HOST "mqtt://broker.mqttdashboard.com"
ENV MQTT_TOPIC "technology_researcher_challenge/events"
ENV API_USER "admin"
ENV API_PASSWORD "notsecureatall"
CMD ["node", "src/index.js"]