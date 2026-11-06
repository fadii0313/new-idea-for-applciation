namespace Aura.Api.Contracts.Responses;

public record CatalogItemResponse(
    string Sku,
    string Name,
    string Category,
    string AssetUrl,
    decimal Price,
    string? Description = null,
    string? ThumbnailUrl = null
);
