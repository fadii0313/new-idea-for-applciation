namespace Aura.Api.Contracts.Responses;

public record GroomingJobResponse(
    string JobId,
    string Status,
    string? OutputUrl,
    string? Error,
    DateTime CreatedAtUtc
);
