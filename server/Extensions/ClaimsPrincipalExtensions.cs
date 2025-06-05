﻿using System.Security.Claims;

namespace FinalProjectAPIs.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static string? GetUserId(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? user.FindFirstValue("sub");
        }
    }
}