using Aura.Api.Contracts.Responses;
using Aura.Api.Infrastructure;
using Aura.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aura.Api.Endpoints;

public static class TryOnEndpoints
{
    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };

    private const long MaxFileSizeBytes = 15 * 1024 * 1024; // 15 MB limit

    public static IEndpointRouteBuilder MapTryOnEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/tryon").WithTags("TryOn");

        group.MapPost("/garment", async (
            [FromForm] IFormFile? userImage,
            [FromForm] string? garmentSku,
            [FromServices] IVtonInferenceService vtonService,
            [FromServices] ICatalogService catalogService,
            CancellationToken ct) =>
        {
            if (userImage is null || userImage.Length == 0)
            {
                return Results.BadRequest(new { error = "Valid user snapshot image is required." });
            }

            if (userImage.Length > MaxFileSizeBytes)
            {
                return Results.BadRequest(new { error = $"Image size exceeds limit of {MaxFileSizeBytes / (1024 * 1024)} MB." });
            }

            if (!AllowedMimeTypes.Contains(userImage.ContentType))
            {
                return Results.BadRequest(new { error = $"Invalid image format '{userImage.ContentType}'. Supported formats: JPEG, PNG, WebP." });
            }

            if (string.IsNullOrWhiteSpace(garmentSku))
            {
                return Results.BadRequest(new { error = "Garment SKU is required." });
            }

            var item = catalogService.GetItemBySku(garmentSku);
            if (item is null)
            {
                return Results.BadRequest(new { error = $"Garment SKU '{garmentSku}' was not found in catalog." });
            }

            using var stream = userImage.OpenReadStream();
            var jobId = await vtonService.EnqueueTryOnAsync(stream, userImage.FileName, garmentSku, ct);

            return Results.Accepted(
                $"/api/tryon/status/{jobId}",
                new { jobId, status = "starting", message = "Inference job successfully queued." }
            );
        })
        .DisableAntiforgery()
        .RequireRateLimiting(RateLimitingConfiguration.TryOnLimiterPolicy)
        .WithName("EnqueueGarmentTryOn")
        .WithSummary("Submit user photograph and target garment SKU for AI diffusion virtual try-on")
        .Produces(StatusCodes.Status202Accepted)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status429TooManyRequests);

        group.MapGet("/status/{jobId}", async (
            string jobId,
            [FromServices] IVtonInferenceService vtonService,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(jobId))
            {
                return Results.BadRequest(new { error = "Job ID parameter is required." });
            }

            try
            {
                var status = await vtonService.GetJobStatusAsync(jobId, ct);
                return Results.Ok(status);
            }
            catch (HttpRequestException ex)
            {
                return Results.Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status502BadGateway,
                    title: "Inference Provider Error"
                );
            }
        })
        .WithName("GetTryOnJobStatus")
        .WithSummary("Poll execution status and resulting composite image of an AI virtual try-on job")
        .Produces<TryOnJobStatusResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status502BadGateway);

        return endpoints;
    }
}
