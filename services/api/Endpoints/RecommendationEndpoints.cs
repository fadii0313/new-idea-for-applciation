using Aura.Api.Contracts.Requests;
using Aura.Api.Contracts.Responses;
using Aura.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aura.Api.Endpoints;

public static class RecommendationEndpoints
{
    public static IEndpointRouteBuilder MapRecommendationEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/recommendations").WithTags("Style Advisor");

        group.MapPost("/analyze", (
            [FromBody] StyleRecommendationRequest request,
            [FromServices] IRecommendationService recommendationService) =>
        {
            var result = recommendationService.GetRecommendations(request.FaceShape, request.Aesthetic);
            return Results.Ok(result);
        })
        .WithName("AnalyzeStyleRecommendation")
        .WithSummary("Generate cross-category fashion and grooming recommendations based on facial geometry and lifestyle aesthetic")
        .Produces<StyleRecommendationResponse>(StatusCodes.Status200OK);

        group.MapGet("/ensembles", (
            [FromQuery] string? faceShape,
            [FromQuery] string? aesthetic,
            [FromServices] IRecommendationService recommendationService) =>
        {
            var shape = string.IsNullOrWhiteSpace(faceShape) ? "Oval Face" : faceShape;
            var result = recommendationService.GetRecommendations(shape, aesthetic);
            return Results.Ok(result.Ensembles);
        })
        .WithName("GetCoordinatedEnsembles")
        .WithSummary("Retrieve coordinated wardrobe and grooming ensembles")
        .Produces<IEnumerable<StyleEnsembleResponse>>(StatusCodes.Status200OK);

        return endpoints;
    }
}
