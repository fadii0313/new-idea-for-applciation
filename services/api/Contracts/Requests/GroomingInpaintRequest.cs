namespace Aura.Api.Contracts.Requests;

public class GroomingInpaintRequest
{
    public IFormFile? UserImage { get; set; }
    public string GroomingType { get; set; } = "facial_hair"; // facial_hair, clean_shave, stubble
    public string StyleName { get; set; } = "clean_shave";    // Chevron, Van Dyke, 3_day_stubble, clean_shave
}
