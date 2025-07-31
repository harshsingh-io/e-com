import sqlite3
import csv

# Create/connect to the database
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Create the products table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        department TEXT NOT NULL
    )
''')

# Clear any existing data
cursor.execute('DELETE FROM products')

# Read data from CSV and insert into database
with open('products.csv', 'r', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        cursor.execute('''
            INSERT INTO products (id, name, price, description, department)
            VALUES (?, ?, ?, ?, ?)
        ''', (row['id'], row['name'], row['price'], row['description'], row['department']))

# Commit changes and close connection
conn.commit()

# Verify the data was inserted
cursor.execute('SELECT COUNT(*) FROM products')
count = cursor.fetchone()[0]
print(f"Successfully created database.db with {count} products")

conn.close()