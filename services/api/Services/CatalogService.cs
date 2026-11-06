using Aura.Api.Contracts.Responses;

namespace Aura.Api.Services;

public interface ICatalogService
{
    IEnumerable<CatalogItemResponse> GetItems(string? category);
    CatalogItemResponse? GetItemBySku(string sku);
}

public class CatalogService : ICatalogService
{
    private static readonly List<CatalogItemResponse> Items =
    [
        new(
            Sku: "SHOE-001",
            Name: "AURA HyperStrobe Runner V1",
            Category: "Footwear",
            AssetUrl: "/models/shoes/runner_v1.glb",
            Price: 189.99m,
            Description: "Ultra-responsive aerogel sole with adaptive carbon plate and luminescent mesh upper.",
            ThumbnailUrl: "/models/shoes/runner_v1_thumb.png"
        ),
        new(
            Sku: "SHOE-002",
            Name: "AURA Street Sneaker Low",
            Category: "Footwear",
            AssetUrl: "/models/shoes/street_sneaker.glb",
            Price: 149.50m,
            Description: "Minimalist full-grain nappa leather silhouette with sculpted rubber cupsole.",
            ThumbnailUrl: "/models/shoes/street_sneaker_thumb.png"
        ),
        new(
            Sku: "SHOE-003",
            Name: "AURA Apex Horizon Trail",
            Category: "Footwear",
            AssetUrl: "/models/shoes/runner_v1.glb",
            Price: 210.00m,
            Description: "All-terrain ruggedized grip with water-repellent ripstop overlay.",
            ThumbnailUrl: "/models/shoes/runner_v1_thumb.png"
        ),
        new(
            Sku: "HOOD-001",
            Name: "Heavyweight Boxy Hoodie - Slate",
            Category: "Apparel",
            AssetUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
            Price: 95.00m,
            Description: "450 GSM organic French Terry cotton with double-layer hood and drop shoulders.",
            ThumbnailUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80"
        ),
        new(
            Sku: "TEE-001",
            Name: "Cybernetic Graphic Tee - Obsidian",
            Category: "Apparel",
            AssetUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
            Price: 48.00m,
            Description: "240 GSM combed jersey with screen-printed reflective studio graphics.",
            ThumbnailUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80"
        ),
        new(
            Sku: "JACKET-001",
            Name: "AURA Modular Tech Bomber - Olive",
            Category: "Apparel",
            AssetUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
            Price: 240.00m,
            Description: "Weather-resistant nylon shell with magnetic closure pockets and storm ribbing.",
            ThumbnailUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80"
        )
    ];

    public IEnumerable<CatalogItemResponse> GetItems(string? category)
    {
        if (string.IsNullOrWhiteSpace(category))
        {
            return Items;
        }

        return Items.Where(i => i.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
    }

    public CatalogItemResponse? GetItemBySku(string sku)
    {
        return Items.FirstOrDefault(i => i.Sku.Equals(sku, StringComparison.OrdinalIgnoreCase));
    }
}

