# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["SnakeGame.csproj", "./"]
RUN dotnet restore "SnakeGame.csproj"

COPY . .
RUN dotnet build "SnakeGame.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SnakeGame.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 5000
ENTRYPOINT ["dotnet", "SnakeGame.dll"]
