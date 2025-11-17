using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SnakeGame.Data;
using SnakeGame.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers().AddNewtonsoftJson();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4242", "https://frontend.dkhasmah.accelerate.novus.legogroup.io")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("DefaultConnection is not configured. Please set the ConnectionStrings__DefaultConnection environment variable.");
}
builder.Services.AddDbContext<SnakeGameDbContext>(options =>
{
    options.UseSqlite(connectionString);
});

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("JWT Key is not configured. Please set the Jwt__Key environment variable.");
}
if (string.IsNullOrEmpty(jwtIssuer))
{
    throw new InvalidOperationException("JWT Issuer is not configured. Please set the Jwt__Issuer environment variable.");
}
if (string.IsNullOrEmpty(jwtAudience))
{
    throw new InvalidOperationException("JWT Audience is not configured. Please set the Jwt__Audience environment variable.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IScoreService, ScoreService>();
builder.Services.AddScoped<IAuthenticationService>(sp =>
    new AuthenticationService(jwtKey, jwtIssuer, jwtAudience));

var app = builder.Build();

// Migrate database on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SnakeGameDbContext>();

    // Ensure the directory exists for the SQLite database file
    if (!string.IsNullOrEmpty(connectionString) && connectionString.Contains("Data Source="))
    {
        var dbPath = connectionString.Split("Data Source=")[1].Split(';')[0];
        var dbDirectory = Path.GetDirectoryName(dbPath);
        if (!string.IsNullOrEmpty(dbDirectory) && !Directory.Exists(dbDirectory))
        {
            Directory.CreateDirectory(dbDirectory);
        }
    }

    db.Database.EnsureCreated();
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
