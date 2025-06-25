using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace ECommerceGameSite.Models
{
    public static class TokenServiceY
    {
        private static readonly string TokenFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "tokens.json");
        private static readonly Dictionary<string, TokenEntry> tokenStore = new();

        static TokenServiceY()
        {
            LoadTokensFromFile();
        }

        public static string GenerateToken(string ipAddress)
        {
            var normalizedIp = NormalizeIp(ipAddress);
            var token = Guid.NewGuid().ToString();
            tokenStore[token] = new TokenEntry
            {
                Token = token,
                CreatedAt = DateTime.UtcNow,
                IpAddress = normalizedIp
            };
            SaveTokensToFile();
            return token;
        }

        public static bool ValidateToken(string token, string ipAddress, bool consume = true)
        {
            if (!tokenStore.TryGetValue(token, out var entry))
                return false;

            var normalizedIp = NormalizeIp(ipAddress);
            if (entry.IpAddress != normalizedIp)
                return false;

            if ((DateTime.UtcNow - entry.CreatedAt).TotalMinutes > 15)
            {
                tokenStore.Remove(token);
                SaveTokensToFile();
                return false;
            }

            if (consume)
            {
                tokenStore.Remove(token);
                SaveTokensToFile();
            }

            return true;
        }

        private static string NormalizeIp(string? ip)
        {
            return ip == "::1" ? "127.0.0.1" : ip ?? "unknown";
        }

        private static void LoadTokensFromFile()
        {
            if (!File.Exists(TokenFilePath)) return;

            try
            {
                var json = File.ReadAllText(TokenFilePath);
                var list = JsonSerializer.Deserialize<List<TokenEntry>>(json);
                if (list != null)
                {
                    foreach (var entry in list)
                    {
                        if (!string.IsNullOrWhiteSpace(entry.Token))
                            tokenStore[entry.Token] = entry;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Token dosyası yüklenemedi: " + ex.Message);
            }
        }

        private static void SaveTokensToFile()
        {
            try
            {
                var list = new List<TokenEntry>(tokenStore.Values);
                var json = JsonSerializer.Serialize(list, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(TokenFilePath, json);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Token dosyası kaydedilemedi: " + ex.Message);
            }
        }
    }

    public class TokenEntry
    {
        public string Token { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string IpAddress { get; set; } = string.Empty;
    }
}
