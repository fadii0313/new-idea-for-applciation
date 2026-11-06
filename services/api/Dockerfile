FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /source
COPY nuget.config .
COPY *.csproj .
RUN dotnet restore -r linux-musl-x64
COPY . .
RUN dotnet publish -c Release -r linux-musl-x64 -o /app --self-contained true /p:PublishTrimmed=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS final
WORKDIR /app
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
COPY --from=build /app .
ENTRYPOINT ["./Aura.Api"]
