### Build and Run
```bash
mvn clean install
```
```bash
java -jar target/cities-picker-java-spring-0.0.1.jar \
-Dbinaflow.schema.directory=../proto-schema \
-Dbinaflow.schema.file=world_cities.proto \
-Dworld-cities-file-path=../world_cities.csv
```