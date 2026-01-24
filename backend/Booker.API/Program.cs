var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

// Enable Swagger
app.UseSwagger();
Console.WriteLine("Swagger enabled at /swagger/v1/swagger.json");

app.UseSwaggerUI();
Console.WriteLine("SwaggerUI enabled at /swagger");

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("Application configured. Starting...");

app.Run();
