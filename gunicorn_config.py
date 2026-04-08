import os

# Set the configuration for Gunicorn
def config():
    return {
        'bind': f'{os.environ["HOST"]}:{os.environ["PORT"]}',
        'workers': 3,
        'timeout': 300,
        'max_request_body_size': 1024 * 1024 * 1000, # 1 GB
        'accesslog': '/tmp/gunicorn_access.log',
        'errorlog': '/tmp/gunicorn_error.log'
    }
