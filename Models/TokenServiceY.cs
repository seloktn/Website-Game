using System;
using System.Collections.Generic;

namespace ECommerceGameSite.Models
{
    public static class TokenServiceY
    {
        private static readonly HashSet<string> validTokens = new HashSet<string>();

        public static string GenerateToken()
        {
            var token = Guid.NewGuid().ToString();
            validTokens.Add(token);
            return token;
        }

        public static bool ValidateToken(string token)
        {
            return validTokens.Contains(token);
        }
    }
}
