export function errorHandler(err, req, res, next) {
  // Default values
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log full error (server-side)
  console.error("🔥 ERROR:", {
    method: req.method,
    url: req.originalUrl,
    status,
    message,
    stack: err.stack,
  });

  // Response payload
  const response = {
    error: message,
  };

  // In development, expose stack trace
  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}
