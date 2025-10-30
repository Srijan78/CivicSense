from pymongo import MongoClient

uri = "mongodb+srv://srijan0612_db_user:srijan2006@civic-sense-db.nwoy4vr.mongodb.net/civic-sense-db?retryWrites=true&w=majority"
client = MongoClient(uri)

try:
    print("✅ Connected successfully!")
    print("Databases:", client.list_database_names())
except Exception as e:
    print("❌ Connection failed:")
    print(e)
