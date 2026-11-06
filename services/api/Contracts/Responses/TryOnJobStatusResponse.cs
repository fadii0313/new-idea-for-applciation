namespace Aura.Api.Contracts.Responses;

public record TryOnJobStatusResponse(
    string JobId,
    string Status,
    string? OutputUrl,
    string? Error,
    DateTime CreatedAtUtc
);
