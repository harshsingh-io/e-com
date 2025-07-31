import sqlite3
import csv

# Create/connect to the database
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Create the departments table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )
''')

# Create the products table with normalized structure
cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        department_id INTEGER NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments (id)
    )
''')

# Clear any existing data
cursor.execute('DELETE FROM products')
cursor.execute('DELETE FROM departments')

# Read CSV and extract unique departments
departments_set = set()
products_data = []

with open('products.csv', 'r', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        departments_set.add(row['department'])
        products_data.append(row)

# Insert unique departments into departments table
department_id_map = {}
for department_name in sorted(departments_set):
    cursor.execute('INSERT INTO departments (name) VALUES (?)', (department_name,))
    department_id = cursor.lastrowid
    department_id_map[department_name] = department_id

# Insert products with department_id references
for product in products_data:
    department_id = department_id_map[product['department']]
    cursor.execute('''
        INSERT INTO products (id, name, price, description, department_id)
        VALUES (?, ?, ?, ?, ?)
    ''', (product['id'], product['name'], product['price'], product['description'], department_id))

# Commit changes
conn.commit()

# Verify the data was inserted correctly
cursor.execute('SELECT COUNT(*) FROM departments')
dept_count = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM products')
product_count = cursor.fetchone()[0]

print(f"Successfully created normalized database:")
print(f"- {dept_count} departments")
print(f"- {product_count} products")

# Show department distribution
print("\nDepartment distribution:")
cursor.execute('''
    SELECT d.name, COUNT(p.id) as product_count
    FROM departments d
    LEFT JOIN products p ON d.id = p.department_id
    GROUP BY d.id, d.name
    ORDER BY product_count DESC
''')

for row in cursor.fetchall():
    print(f"- {row[0]}: {row[1]} products")

conn.close()