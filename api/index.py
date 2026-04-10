from mangum import Mangum

from src.api.server import app

handler = Mangum(app, lifespan="off")
