var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();

var app = builder.Build();
app.MapOpenApi();
app.MapGet("/xml", SampleEndpoints.Get);
app.MapGet("/literal", () => "ok")
    .WithSummary("First summary line.\nSecond summary line.")
    .WithDescription("First description line.\nSecond description line.");
app.Run();
