# Multi-stage build for donations-service (Java 21)
FROM maven:3.9.4-eclipse-temurin-21 AS builder
WORKDIR /workspace
# Copy Maven wrapper and pom first for better layer caching
COPY .mvn .mvn
COPY mvnw pom.xml ./
# Copy source code
COPY src ./src
# Build jar (skip tests for faster build)
RUN mvn -B -DskipTests package

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app
# Copy built jar from builder stage
COPY --from=builder /workspace/target/*.jar app.jar
# Expose port (donations-service runs on 8084)
EXPOSE 8084
# Run the application
ENTRYPOINT ["java","-jar","/app/app.jar"]
