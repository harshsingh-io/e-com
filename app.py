from flask import Flask, jsonify, send_from_directory, request
import sqlite3

app = Flask(__name__)

def get_db_connection():
    """Helper function to get database connection"""
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn

# Serve static files
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# Serve index.html at root
@app.route('/')
def index():
    with open('index.html', 'r') as f:
        return f.read()

# Also serve index.html at /index.html for navigation consistency
@app.route('/index.html')
def index_html():
    with open('index.html', 'r') as f:
        return f.read()

# Serve product.html
@app.route('/product.html')
def product_page():
    with open('product.html', 'r') as f:
        return f.read()

# NEW: Departments API endpoint
@app.route('/api/departments', methods=['GET'])
def get_all_departments():
    """GET /api/departments - Fetch all departments from the database"""
    try:
        conn = get_db_connection()
        departments = conn.execute('SELECT id, name FROM departments ORDER BY name').fetchall()
        conn.close()
        
        # Convert to list of dictionaries
        departments_list = []
        for department in departments:
            departments_list.append({
                'id': department['id'],
                'name': department['name']
            })
        
        return jsonify(departments_list)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['GET'])
def get_all_products():
    """GET /api/products - Fetch all products with optional department filtering"""
    try:
        conn = get_db_connection()
        
        # Check for department_id filter parameter
        department_id = request.args.get('department_id')
        
        if department_id:
            # Filter by department_id
            products = conn.execute('''
                SELECT p.id, p.name, p.price, p.description, d.name as department
                FROM products p
                JOIN departments d ON p.department_id = d.id
                WHERE p.department_id = ?
                ORDER BY p.id
            ''', (department_id,)).fetchall()
        else:
            # Get all products with department names via JOIN
            products = conn.execute('''
                SELECT p.id, p.name, p.price, p.description, d.name as department
                FROM products p
                JOIN departments d ON p.department_id = d.id
                ORDER BY p.id
            ''').fetchall()
        
        conn.close()
        
        # Convert to list of dictionaries
        products_list = []
        for product in products:
            products_list.append({
                'id': product['id'],
                'name': product['name'],
                'price': product['price'],
                'description': product['description'],
                'department': product['department']
            })
        
        return jsonify(products_list)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_by_id(product_id):
    """GET /api/products/<id> - Fetch a single product by its ID with department name"""
    try:
        conn = get_db_connection()
        product = conn.execute('''
            SELECT p.id, p.name, p.price, p.description, d.name as department
            FROM products p
            JOIN departments d ON p.department_id = d.id
            WHERE p.id = ?
        ''', (product_id,)).fetchone()
        conn.close()
        
        if product is None:
            return jsonify({'error': 'Product not found'}), 404
        
        # Convert to dictionary
        product_dict = {
            'id': product['id'],
            'name': product['name'],
            'price': product['price'],
            'description': product['description'],
            'department': product['department']
        }
        
        return jsonify(product_dict)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)