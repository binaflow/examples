FROM maven:3.9.9-amazoncorretto-21 as mavenBuilder
COPY backend-java-spring .
COPY proto-schema proto-schema
RUN yum install -y unzip
RUN curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v28.3/protoc-28.3-linux-x86_64.zip
RUN unzip protoc-28.3-linux-x86_64.zip -d /usr/local
RUN mvn package

FROM node:20 as npmBuilder
COPY frontend-js .
COPY proto-schema proto-schema
RUN apt update && apt install -y protobuf-compiler
RUN npm install -g protoc-gen-js
RUN npm ci
RUN npm run build

FROM amazoncorretto:21
COPY proto-schema proto-schema
COPY --from=npmBuilder /dist /frontend-js
COPY --from=mavenBuilder /target/cities-picker-java-spring*.jar cities-picker-java-spring.jar
EXPOSE 8080
CMD ["sh", "-c", "java -jar cities-picker-java-spring.jar"]