using System.Collections.Concurrent;
using System.Text.Json;
using Aura.Api.Contracts.Responses;
using StackExchange.Redis;

namespace Aura.Api.Infrastructure;

public interface IJobCache
{
    Task SetJobAsync(TryOnJobStatusResponse job, TimeSpan? expiry = null, CancellationToken ct = default);
    Task<TryOnJobStatusResponse?> GetJobAsync(string jobId, CancellationToken ct = default);
}

public class RedisJobCache : IJobCache
{
    private readonly IConnectionMultiplexer? _redis;
    private readonly IDatabase? _db;
    private readonly ILogger<RedisJobCache> _logger;
    private readonly ConcurrentDictionary<string, (TryOnJobStatusResponse Job, DateTime ExpiresAt)> _memoryFallback = new();

    public RedisJobCache(IConfiguration configuration, ILogger<RedisJobCache> logger)
    {
        _logger = logger;
        var connectionString = configuration.GetConnectionString("Redis") ?? "localhost:6379";

        try
        {
            var options = ConfigurationOptions.Parse(connectionString);
            options.AbortOnConnectFail = false;
            options.ConnectTimeout = 1500;
            _redis = ConnectionMultiplexer.Connect(options);
            _db = _redis.GetDatabase();
            _logger.LogInformation("Connected to Redis at {ConnectionString}", connectionString);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not establish Redis connection. Falling back to resilient in-memory job cache.");
            _redis = null;
            _db = null;
        }
    }

    public async Task SetJobAsync(TryOnJobStatusResponse job, TimeSpan? expiry = null, CancellationToken ct = default)
    {
        var ttl = expiry ?? TimeSpan.FromHours(2);

        if (_db is not null && _redis is not null && _redis.IsConnected)
        {
            try
            {
                var json = JsonSerializer.Serialize(job);
                await _db.StringSetAsync($"vton:job:{job.JobId}", json, ttl);
                return;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to write to Redis, falling back to local memory cache");
            }
        }

        _memoryFallback[job.JobId] = (job, DateTime.UtcNow.Add(ttl));
    }

    public async Task<TryOnJobStatusResponse?> GetJobAsync(string jobId, CancellationToken ct = default)
    {
        if (_db is not null && _redis is not null && _redis.IsConnected)
        {
            try
            {
                var val = await _db.StringGetAsync($"vton:job:{jobId}");
                if (val.HasValue)
                {
                    return JsonSerializer.Deserialize<TryOnJobStatusResponse>(val.ToString());
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to read from Redis, reading from local memory cache");
            }
        }

        if (_memoryFallback.TryGetValue(jobId, out var cached))
        {
            if (cached.ExpiresAt > DateTime.UtcNow)
            {
                return cached.Job;
            }
            _memoryFallback.TryRemove(jobId, out _);
        }

        return null;
    }
}

