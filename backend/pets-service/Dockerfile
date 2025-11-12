# Multi-stage build for pets-service (Java 17)
FROM maven:3.9.4-eclipse-temurin-17 AS builder
WORKDIR /workspace
# Copy Maven wrapper and pom first for better layer caching
COPY .mvn .mvn
COPY mvnw pom.xml ./
# Copy source code
COPY src ./src
# Build jar (skip tests for faster build)
RUN mvn -B -DskipTests package

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app
# Copy built jar from builder stage
COPY --from=builder /workspace/target/*.jar app.jar
# Expose port (pets-service runs on 8082)
EXPOSE 8082
# Run the application
ENTRYPOINT ["java","-jar","/app/app.jar"]
