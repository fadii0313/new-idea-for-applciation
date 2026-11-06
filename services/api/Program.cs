using System.Net.Http.Headers;
using Aura.Api.Endpoints;
using Aura.Api.Infrastructure;
using Aura.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// CORS Policy: allow local Next.js, Vercel deployments, and production origins
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("AllowClient", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001",
                "https://aura-studio.vercel.app"
            )
            .SetIsOriginAllowed(origin =>
            {
                // Allow localhost on any port for local development
                if (Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                {
                    return uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
                           || uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase);
                }
                return false;
            })
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Configure Rate Limiting
builder.Services.AddAuraRateLimiting();

// OpenAPI support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Replicate HTTP Client
builder.Services.AddHttpClient("ReplicateClient", (sp, client) =>
{
    client.BaseAddress = new Uri("https://api.replicate.com/v1/");
    var config = sp.GetRequiredService<IConfiguration>();
    var apiToken = config["REPLICATE_API_TOKEN"];

    if (!string.IsNullOrWhiteSpace(apiToken) && !apiToken.Contains("your_actual_replicate_token"))
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiToken);
    }
    client.Timeout = TimeSpan.FromSeconds(120);
});

// Domain Services & Dependency Injection
builder.Services.AddSingleton<IJobCache, RedisJobCache>();
builder.Services.AddSingleton<ICatalogService, CatalogService>();
builder.Services.AddSingleton<IStorageService, S3StorageService>();
builder.Services.AddSingleton<IVtonInferenceService, ReplicateVtonService>();

// Health Checks
builder.Services.AddHealthChecks();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowClient");
app.UseRateLimiter();

// Health Check endpoint
app.MapHealthChecks("/health");

// Root status endpoint
app.MapGet("/", () => Results.Ok(new
{
    service = "AURA Virtual Try-On Studio API Gateway",
    version = "1.0.0",
    status = "healthy",
    engine = "ASP.NET Core 9 Minimal API",
    capabilities = new[] { "Footwear AR Metadata", "IDM-VTON Garment Diffusion Gateway" }
}));

// Map Feature Endpoints
app.MapCatalogEndpoints();
app.MapTryOnEndpoints();

app.Run();
