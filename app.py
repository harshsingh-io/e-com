from flask import Flask, jsonify
import sqlite3

app = Flask(__name__)

def get_db_connection():
    """Helper function to get database connection"""
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn

@app.route('/api/products', methods=['GET'])
def get_all_products():
    """GET /api/products - Fetch all products from the database"""
    try:
        conn = get_db_connection()
        products = conn.execute('SELECT * FROM products').fetchall()
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
    """GET /api/products/<id> - Fetch a single product by its ID"""
    try:
        conn = get_db_connection()
        product = conn.execute('SELECT * FROM products WHERE id = ?', (product_id,)).fetchone()
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