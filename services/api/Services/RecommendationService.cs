using Aura.Api.Contracts.Responses;

namespace Aura.Api.Services;

public interface IRecommendationService
{
    StyleRecommendationResponse GetRecommendations(string faceShape, string? aesthetic);
}

public class RecommendationService : IRecommendationService
{
    public StyleRecommendationResponse GetRecommendations(string faceShape, string? aesthetic)
    {
        var targetAesthetic = string.IsNullOrWhiteSpace(aesthetic) ? "Streetwear" : aesthetic;

        string advice = faceShape switch
        {
            "Round Face" => "Add vertical elongation and angularity using a Van Dyke, sharp Goatee, or tapered Short Boxed Beard with trimmed sideburns.",
            "Square Face" => "Soften cheekbone and jawline edges with rounded beards, heavy stubble, or a soft Balbo; avoid harsh boxed cheek lines.",
            "Oblong / Rectangular Face" => "Broaden lateral width with full mustache styles, fuller sideburns, and shallow chin hair to prevent excessive vertical elongation.",
            "Heart & Diamond Face" => "Build volume at the jawline and chin with classic chin straps or uniform medium beards to establish structural equilibrium.",
            _ => "Harmonious proportions where face length exceeds cheekbone width. Versatile aesthetic canvas supporting balanced styles."
        };

        var allEnsembles = new List<StyleEnsembleResponse>
        {
            new(
                Id: "ens-streetwear-01",
                Aesthetic: "Streetwear",
                Title: "Cyber-Neo Obsidian Drop",
                HarmonyScore: faceShape.Contains("Round") || faceShape.Contains("Square") ? 96 : 91,
                Description: "Sharp, architectural street silhouettes balancing bold facial geometry with heavyweight drop-shoulder fleece.",
                Grooming: new("Van Dyke", "Angular pointed chin contour and defined floating mustache.", "Beard", "/try-on/grooming?beard=Van%20Dyke"),
                Apparel: new("HOOD-001", "Heavyweight Boxy Hoodie - Slate", "Fleece", 95.00m, "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80", "/try-on/apparel?sku=HOOD-001"),
                HeadwearEyewear: new("Ribbed Knit Studio Beanie + Shield Shades", "Headwear", "Merino-blend micro-ribbed beanie with wrap-around tinted acrylic shades.", "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=500&q=80"),
                Footwear: new("SHOE-001", "AURA HyperStrobe Runner V1", 189.99m, "/models/shoes/runner_v1_thumb.png", "/try-on/footwear?sku=SHOE-001")
            ),
            new(
                Id: "ens-smart-casual-01",
                Aesthetic: "Smart Casual",
                Title: "Atelier Minimalist Luxe",
                HarmonyScore: faceShape.Contains("Oval") || faceShape.Contains("Square") ? 98 : 89,
                Description: "Structured yet relaxed tailoring with clean jawline taper and premium full-grain leather footwear.",
                Grooming: new("Short Boxed Beard", "Neatly groomed perimeter with razor-tapered cheek line.", "Beard", "/try-on/grooming?beard=Short%20Boxed%20Beard"),
                Apparel: new("JACKET-001", "AURA Modular Tech Bomber - Olive", "Outerwear", 240.00m, "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80", "/try-on/apparel?sku=JACKET-001"),
                HeadwearEyewear: new("Acetate Clubmaster Eyewear", "Eyewear", "Hand-polished tortoiseshell acetate with anti-reflective sapphire lenses.", "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80"),
                Footwear: new("SHOE-002", "AURA Street Sneaker Low", 149.50m, "/models/shoes/street_sneaker_thumb.png", "/try-on/footwear?sku=SHOE-002")
            ),
            new(
                Id: "ens-casual-weekend-01",
                Aesthetic: "Casual Weekend",
                Title: "Heritage Coastline Relaxed",
                HarmonyScore: faceShape.Contains("Heart") || faceShape.Contains("Oblong") ? 94 : 88,
                Description: "Effortless weekend staples combining textured jersey, timeless round eyewear, and court silhouettes.",
                Grooming: new("Chevron", "Full natural mustache with softened corners, paired with 2-day micro stubble.", "Mustache", "/try-on/grooming?mustache=Chevron"),
                Apparel: new("TEE-001", "Cybernetic Graphic Tee - Obsidian", "T-Shirts", 48.00m, "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80", "/try-on/apparel?sku=TEE-001"),
                HeadwearEyewear: new("Vintage 6-Panel Cap + Polarized Rounds", "Headwear", "Washed chino twill strapback paired with lightweight metal round sunframes.", "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=500&q=80"),
                Footwear: new("SHOE-002", "AURA Street Sneaker Low", 149.50m, "/models/shoes/street_sneaker_thumb.png", "/try-on/footwear?sku=SHOE-002")
            ),
            new(
                Id: "ens-formal-business-01",
                Aesthetic: "Formal / Business",
                Title: "Executive Sovereign Tailoring",
                HarmonyScore: faceShape.Contains("Oval") || faceShape.Contains("Round") ? 97 : 92,
                Description: "Sharp geometric contrast pairing sculpted jawline contours or clean shave with razor-sharp wool lapels.",
                Grooming: new("Clean Shave & Tight Stubble", "Ultra-clean razor fade along the neckline with micro 1-day shadow shading.", "Clean Shave", "/try-on/grooming?shave=clean"),
                Apparel: new("JACKET-001", "AURA Modular Tech Bomber - Olive", "Tailoring", 240.00m, "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80", "/try-on/apparel?sku=JACKET-001"),
                HeadwearEyewear: new("Titanium Wire-Frame Spectacles", "Eyewear", "Featherweight Japanese beta-titanium rimless frames with anti-fatigue coating.", "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=500&q=80"),
                Footwear: new("SHOE-003", "AURA Apex Horizon Trail", 210.00m, "/models/shoes/runner_v1_thumb.png", "/try-on/footwear?sku=SHOE-003")
            )
        };

        var filtered = allEnsembles
            .Where(e => e.Aesthetic.Equals(targetAesthetic, StringComparison.OrdinalIgnoreCase))
            .ToList();

        if (filtered.Count == 0)
        {
            filtered = allEnsembles;
        }

        return new StyleRecommendationResponse(faceShape, targetAesthetic, advice, filtered);
    }
}
