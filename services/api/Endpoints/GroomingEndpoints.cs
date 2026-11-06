using Aura.Api.Contracts.Responses;
using Aura.Api.Infrastructure;
using Aura.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aura.Api.Endpoints;

public static class GroomingEndpoints
{
    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };

    public static IEndpointRouteBuilder MapGroomingEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/grooming").WithTags("Facial Grooming");

        group.MapPost("/inpaint", async (
            [FromForm] IFormFile? userImage,
            [FromForm] string? groomingType,
            [FromForm] string? styleName,
            [FromServices] IGroomingService groomingService,
            CancellationToken ct) =>
        {
            if (userImage is null || userImage.Length == 0)
            {
                return Results.BadRequest(new { error = "Valid user facial snapshot image is required." });
            }

            if (!AllowedMimeTypes.Contains(userImage.ContentType))
            {
                return Results.BadRequest(new { error = $"Invalid image format '{userImage.ContentType}'." });
            }

            var type = string.IsNullOrWhiteSpace(groomingType) ? "facial_hair" : groomingType;
            var style = string.IsNullOrWhiteSpace(styleName) ? "clean_shave" : styleName;

            using var stream = userImage.OpenReadStream();
            var jobId = await groomingService.EnqueueGroomingInpaintAsync(stream, userImage.FileName, type, style, ct);

            return Results.Accepted(
                $"/api/grooming/status/{jobId}",
                new { jobId, status = "starting", message = "Grooming inpainting job successfully queued." }
            );
        })
        .DisableAntiforgery()
        .RequireRateLimiting(RateLimitingConfiguration.TryOnLimiterPolicy)
        .WithName("EnqueueGroomingInpaint")
        .WithSummary("Submit face photograph for photorealistic generative grooming inpainting")
        .Produces(StatusCodes.Status202Accepted)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapGet("/status/{jobId}", async (
            string jobId,
            [FromServices] IGroomingService groomingService,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(jobId))
            {
                return Results.BadRequest(new { error = "Job ID parameter is required." });
            }

            try
            {
                var status = await groomingService.GetGroomingJobStatusAsync(jobId, ct);
                return Results.Ok(status);
            }
            catch (HttpRequestException ex)
            {
                return Results.Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status502BadGateway,
                    title: "Inpainting Provider Error"
                );
            }
        })
        .WithName("GetGroomingJobStatus")
        .WithSummary("Poll execution status of a facial grooming inpainting job")
        .Produces<GroomingJobResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status502BadGateway);

        return endpoints;
    }
}

