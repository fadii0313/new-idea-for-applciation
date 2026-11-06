namespace Aura.Api.Contracts.Requests;

public class GarmentTryOnRequest
{
    public IFormFile? UserImage { get; set; }
    public string GarmentSku { get; set; } = string.Empty;
    public string? Category { get; set; } = "upper_body";
    public string? GarmentDescription { get; set; }
    public int Steps { get; set; } = 30;
}
