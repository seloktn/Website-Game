using AspNetCoreRateLimit;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://0.0.0.0:5181");


// Servisleri ekle
builder.Services.AddControllersWithViews();

//game1
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowGameClient", policy =>
    {
        policy
          .WithOrigins("http://localhost:5181")    //TODO: oyunun çalıştığı adresi gir
          .AllowAnyMethod()
          .WithHeaders("Content-Type", "X-Signature");
    });
});
builder.Services.AddMemoryCache();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors(o => o.AddPolicy("Default", p =>
{
    p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
}));


// 1) appsettings.json’den IpRateLimiting bölümü
builder.Services.AddOptions();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));

// 2) Rate limit store & counter
builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();


// 3) Rate limiter
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();



//game1 end

var app = builder.Build();



// Middleware ekle
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

// **Güncellenmiş Route Tanımı** (UseEndpoints yerine)
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}"
);


//game 1
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

app.UseCors("Default");

app.UseIpRateLimiting();

app.UseCors("AllowGameClient");
//game1 end

app.MapControllers();

app.Run();