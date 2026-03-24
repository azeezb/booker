using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// CORS - Allow frontend to call API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Log to console
Console.WriteLine("Starting Booker API...");
Console.WriteLine($"Environment: {app.Environment.EnvironmentName}");

app.MapOpenApi();
app.MapScalarApiReference();
Console.WriteLine("Scalar API reference enabled at /scalar/v1");

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("Application configured. Starting...");

app.Run();
