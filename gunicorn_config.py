import os

# Bind to Render's PORT environment variable
bind = f"0.0.0.0:{os.environ.get('PORT', 10000)}"

# Reduce workers to save memory (512MB limit on free tier)
workers = 1
worker_class = "sync"
threads = 2

# Timeouts
timeout = 120
keepalive = 5

# Memory management
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Preload app to save memory
preload_app = False
