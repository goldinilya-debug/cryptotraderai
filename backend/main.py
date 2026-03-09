# Simple entry point - no relative imports issue
import sys
import os

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Now import app
from app.main import app as application

# Expose as 'app' for uvicorn
app = application

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
