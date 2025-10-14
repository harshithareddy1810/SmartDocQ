import os
import multiprocessing

# Bind to the PORT environment variable
bind = f"0.0.0.0:{os.environ.get('PORT', 10000)}"

# Worker configuration for low memory
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
