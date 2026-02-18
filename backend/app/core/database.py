from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    def __init__(self):
        self.client = AsyncIOMotorClient(settings.MONGO_URL)
        self.db = self.client[settings.DB_NAME]

    def connect(self):
        print(f"Connected to MongoDB: {settings.DB_NAME}")

    def close(self):
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")

db = Database()

# Helper to get collection
def get_collection(collection_name: str):
    return db.db[collection_name]
