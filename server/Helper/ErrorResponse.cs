using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace FinalProjectAPIs.Helpers
{
    public class ErrorResponse
    {
        public int StatusCode { get; }
        public string Message { get; }
        public string ErrorCode { get; }
        public Dictionary<string, List<string>>? Errors { get; }

        public ErrorResponse(int statusCode, string message, string errorCode)
        {
            StatusCode = statusCode;
            Message = message;
            ErrorCode = errorCode;
        }

        public ErrorResponse(int statusCode, ModelStateDictionary modelState)
        {
            StatusCode = statusCode;
            Message = "Validation failed";
            ErrorCode = "VALIDATION_ERROR";
            Errors = new Dictionary<string, List<string>>();

            foreach (var entry in modelState)
            {
                var errors = entry.Value.Errors
                    .Select(e => e.ErrorMessage)
                    .ToList();

                if (errors.Count > 0)
                    Errors.Add(entry.Key, errors);
            }
        }

        // Existing methods
        public static ErrorResponse InternalServerError() =>
            new(500, "An unexpected error occurred", "INTERNAL_ERROR");

        public static ErrorResponse DatabaseError() =>
            new(500, "Database operation failed", "DATABASE_ERROR");

        // New methods added for TeamsController
        public static ErrorResponse NotFound(string resource) =>
            new(404, $"{resource} not found", "NOT_FOUND");

        public static ErrorResponse Unauthorized() =>
            new(401, "Authentication required", "UNAUTHORIZED");

        public static ErrorResponse Forbidden() =>
            new(403, "Insufficient permissions", "FORBIDDEN");

        public static ErrorResponse Conflict(string message) =>
            new(409, message, "CONFLICT");

        public static ErrorResponse BadRequest(string message) =>
            new(400, message, "BAD_REQUEST");
    }
}