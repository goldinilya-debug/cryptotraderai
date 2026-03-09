# Entry point for Render deployment
import sys
sys.path.insert(0, '/opt/render/project/src/backend')

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
