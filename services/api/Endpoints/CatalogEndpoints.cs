using Aura.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aura.Api.Endpoints;

public static class CatalogEndpoints
{
    public static IEndpointRouteBuilder MapCatalogEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/catalog").WithTags("Catalog");

        group.MapGet("/items", (
            [FromQuery] string? category,
            [FromServices] ICatalogService catalogService) =>
        {
            var items = catalogService.GetItems(category);
            return Results.Ok(items);
        })
        .WithName("GetCatalogItems")
        .WithSummary("Retrieve catalog products filtered optionally by category (Footwear, Apparel)")
        .Produces<IEnumerable<Contracts.Responses.CatalogItemResponse>>(StatusCodes.Status200OK);

        group.MapGet("/items/{sku}", (
            string sku,
            [FromServices] ICatalogService catalogService) =>
        {
            var item = catalogService.GetItemBySku(sku);
            if (item is null)
            {
                return Results.NotFound(new { error = $"Product with SKU '{sku}' not found." });
            }
            return Results.Ok(item);
        })
        .WithName("GetCatalogItemBySku")
        .WithSummary("Retrieve details for a single catalog item by SKU")
        .Produces<Contracts.Responses.CatalogItemResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        return endpoints;
    }
}
