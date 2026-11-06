using System.Text.Json;
using Aura.Api.Contracts.Responses;
using Aura.Api.Infrastructure;

namespace Aura.Api.Services;

public interface IGroomingService
{
    Task<string> EnqueueGroomingInpaintAsync(Stream fileStream, string fileName, string groomingType, string styleName, CancellationToken ct);
    Task<GroomingJobResponse> GetGroomingJobStatusAsync(string jobId, CancellationToken ct);
}

public class GroomingService : IGroomingService
{
    private readonly IHttpClientFactory _clientFactory;
    private readonly IConfiguration _config;
    private readonly IJobCache _jobCache;
    private readonly ILogger<GroomingService> _logger;

    public GroomingService(
        IHttpClientFactory clientFactory,
        IConfiguration config,
        IJobCache jobCache,
        ILogger<GroomingService> logger)
    {
        _clientFactory = clientFactory;
        _config = config;
        _jobCache = jobCache;
        _logger = logger;
    }

    public async Task<string> EnqueueGroomingInpaintAsync(
        Stream fileStream,
        string fileName,
        string groomingType,
        string styleName,
        CancellationToken ct)
    {
        var apiToken = _config["REPLICATE_API_TOKEN"];
        var isRealToken = !string.IsNullOrWhiteSpace(apiToken) && !apiToken.Contains("your_actual_replicate_token");

        using var ms = new MemoryStream();
        await fileStream.CopyToAsync(ms, ct);
        var base64Img = $"data:image/jpeg;base64,{Convert.ToBase64String(ms.ToArray())}";

        if (!isRealToken)
        {
            var mockJobId = $"groom_sim_{Guid.NewGuid():N}";
            var job = new TryOnJobStatusResponse(
                JobId: mockJobId,
                Status: "starting",
                OutputUrl: null,
                Error: null,
                CreatedAtUtc: DateTime.UtcNow
            );

            await _jobCache.SetJobAsync(job, TimeSpan.FromHours(1), ct);
            _logger.LogInformation("Enqueued simulated grooming inpainting job: {JobId} for style: {StyleName}", mockJobId, styleName);
            return mockJobId;
        }

        var client = _clientFactory.CreateClient("ReplicateClient");
        var payload = new
        {
            version = "fb8af171cfa1616ddcf1242fa093f9c46e3a3c912b69f494153ae0d307a283ec", // FLUX.1-Fill inpainting
            input = new
            {
                image = base64Img,
                prompt = $"photorealistic salon-grade facial grooming, {styleName} beard style, clean dermal skin pores, natural hair follicles, 8k portrait photography",
                steps = 28
            }
        };

        var response = await client.PostAsJsonAsync("predictions", payload, ct);
        response.EnsureSuccessStatusCode();

        using var jsonDoc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
        var jobId = jsonDoc.RootElement.GetProperty("id").GetString()!;

        var realJob = new TryOnJobStatusResponse(
            JobId: jobId,
            Status: "starting",
            OutputUrl: null,
            Error: null,
            CreatedAtUtc: DateTime.UtcNow
        );

        await _jobCache.SetJobAsync(realJob, TimeSpan.FromHours(1), ct);
        return jobId;
    }

    public async Task<GroomingJobResponse> GetGroomingJobStatusAsync(string jobId, CancellationToken ct)
    {
        var cached = await _jobCache.GetJobAsync(jobId, ct);

        if (jobId.StartsWith("groom_sim_"))
        {
            var createdAt = cached?.CreatedAtUtc ?? DateTime.UtcNow;
            var elapsed = (DateTime.UtcNow - createdAt).TotalSeconds;

            if (elapsed < 2.5)
            {
                return new GroomingJobResponse(jobId, "starting", null, null, createdAt);
            }
            if (elapsed < 5.0)
            {
                return new GroomingJobResponse(jobId, "processing", null, null, createdAt);
            }

            // Photorealistic salon inpainting result preview
            var outputUrl = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1080&q=85";
            return new GroomingJobResponse(jobId, "succeeded", outputUrl, null, createdAt);
        }

        var client = _clientFactory.CreateClient("ReplicateClient");
        var response = await client.GetAsync($"predictions/{jobId}", ct);
        response.EnsureSuccessStatusCode();

        using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
        var root = doc.RootElement;
        var status = root.GetProperty("status").GetString()!;

        string? outputUrlResult = null;
        if (status == "succeeded" && root.TryGetProperty("output", out var outputProp))
        {
            outputUrlResult = outputProp.ValueKind == JsonValueKind.Array
                ? outputProp[0].GetString()
                : outputProp.GetString();
        }

        string? error = null;
        if (root.TryGetProperty("error", out var errorProp) && errorProp.ValueKind != JsonValueKind.Null)
        {
            error = errorProp.GetString();
        }

        return new GroomingJobResponse(jobId, status, outputUrlResult, error, cached?.CreatedAtUtc ?? DateTime.UtcNow);
    }
}
