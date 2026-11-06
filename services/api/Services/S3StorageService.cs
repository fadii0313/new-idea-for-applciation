namespace Aura.Api.Services;

public interface IStorageService
{
    Task<string> UploadImageAsync(Stream stream, string fileName, string contentType, CancellationToken ct);
    Task<Stream?> GetImageAsync(string fileKey, CancellationToken ct);
}

public class S3StorageService : IStorageService
{
    private readonly IConfiguration _config;
    private readonly ILogger<S3StorageService> _logger;
    private readonly string _storageDirectory;

    public S3StorageService(IConfiguration config, ILogger<S3StorageService> logger)
    {
        _config = config;
        _logger = logger;
        _storageDirectory = Path.Combine(AppContext.BaseDirectory, "Storage", "Uploads");

        if (!Directory.Exists(_storageDirectory))
        {
            Directory.CreateDirectory(_storageDirectory);
        }
    }

    public async Task<string> UploadImageAsync(Stream stream, string fileName, string contentType, CancellationToken ct)
    {
        var safeFileName = $"{Guid.NewGuid():N}_{Path.GetFileName(fileName)}";
        var localPath = Path.Combine(_storageDirectory, safeFileName);

        using var fileStream = new FileStream(localPath, FileMode.Create, FileAccess.Write, FileShare.None);
        await stream.CopyToAsync(fileStream, ct);

        _logger.LogInformation("Stored file {FileName} locally at {Path}", fileName, localPath);

        // Return a relative URL that can be served via static file provider or proxy
        return $"/uploads/{safeFileName}";
    }

    public Task<Stream?> GetImageAsync(string fileKey, CancellationToken ct)
    {
        var localPath = Path.Combine(_storageDirectory, Path.GetFileName(fileKey));
        if (File.Exists(localPath))
        {
            Stream fs = new FileStream(localPath, FileMode.Open, FileAccess.Read, FileShare.Read);
            return Task.FromResult<Stream?>(fs);
        }

        return Task.FromResult<Stream?>(null);
    }
}
