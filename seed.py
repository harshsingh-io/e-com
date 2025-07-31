import csv
from faker import Faker
import random

# Initialize Faker
fake = Faker()

# Define departments
departments = ["Books", "Electronics", "Home Goods", "Clothing", "Sports", "Beauty", "Toys", "Automotive"]

# Generate 100 fake products
products = []
for i in range(1, 101):
    product = {
        'id': i,
        'name': fake.catch_phrase(),
        'price': round(random.uniform(5.99, 999.99), 2),
        'description': fake.text(max_nb_chars=200),
        'department': random.choice(departments)
    }
    products.append(product)

# Write to CSV file
with open('products.csv', 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['id', 'name', 'price', 'description', 'department']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    writer.writeheader()
    for product in products:
        writer.writerow(product)

print("Successfully generated 100 fake products in products.csv")