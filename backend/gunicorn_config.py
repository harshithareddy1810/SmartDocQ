import os

# Reduce workers to save memory on Render's 512MB limit
workers = 1  # Changed from 2-4 to 1
worker_class = "sync"
worker_connections = 100  # Reduced from 1000
timeout = 120
keepalive = 5

# Memory optimization
max_requests = 100  # Restart workers after 100 requests to prevent memory leaks
max_requests_jitter = 20

# Bind to the PORT environment variable
bind = f"0.0.0.0:{os.getenv('PORT', '10000')}"

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"