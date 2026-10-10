# Stage 1: Build the application
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# Chỉ copy file cấu hình maven trước để tận dụng cache
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline

# Copy mã nguồn và build
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application (Image siêu nhẹ)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
