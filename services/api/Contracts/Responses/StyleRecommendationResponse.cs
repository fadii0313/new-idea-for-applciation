namespace Aura.Api.Contracts.Responses;

public record EnsembleGroomingItem(string Style, string Description, string Type, string TryOnUrl);
public record EnsembleApparelItem(string Sku, string Name, string Category, decimal Price, string ImageUrl, string TryOnUrl);
public record EnsembleAccessoryItem(string Name, string Type, string Description, string ImageUrl);
public record EnsembleFootwearItem(string Sku, string Name, decimal Price, string ImageUrl, string TryOnUrl);

public record StyleEnsembleResponse(
    string Id,
    string Aesthetic,
    string Title,
    int HarmonyScore,
    string Description,
    EnsembleGroomingItem Grooming,
    EnsembleApparelItem Apparel,
    EnsembleAccessoryItem HeadwearEyewear,
    EnsembleFootwearItem Footwear
);

public record StyleRecommendationResponse(
    string FaceShape,
    string SelectedAesthetic,
    string StrategicAdvice,
    List<StyleEnsembleResponse> Ensembles
);

