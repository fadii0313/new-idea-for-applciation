using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace Aura.Api.Infrastructure;

public static class RateLimitingConfiguration
{
    public const string GlobalLimiterPolicy = "GlobalPolicy";
    public const string TryOnLimiterPolicy = "TryOnPolicy";

    public static IServiceCollection AddAuraRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            // Global partition rate limiter
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
            {
                var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown_client";
                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: clientIp,
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 60,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 10
                    });
            });

            // Dedicated policy for heavy generative inference try-on endpoints
            options.AddPolicy(TryOnLimiterPolicy, context =>
            {
                var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown_client";
                return RateLimitPartition.GetTokenBucketLimiter(
                    partitionKey: clientIp,
                    factory: _ => new TokenBucketRateLimiterOptions
                    {
                        TokenLimit = 10,
                        ReplenishmentPeriod = TimeSpan.FromSeconds(30),
                        TokensPerPeriod = 5,
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 2
                    });
            });
        });

        return services;
    }
}
