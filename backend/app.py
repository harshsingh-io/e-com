from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_db_connection():
    """Helper function to get database connection"""
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn

# API Routes only - no template serving
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
    """GET /api/products - Fetch all products with optional department filtering, search, and pagination"""
    try:
        conn = get_db_connection()
        
        # Get query parameters
        department_id = request.args.get('department_id')
        search_query = request.args.get('search', '').strip()
        page = int(request.args.get('page', 1))  # Default to page 1
        per_page = int(request.args.get('per_page', 12))  # Default to 12 products per page
        
        # Calculate offset for pagination
        offset = (page - 1) * per_page
        
        # Build WHERE conditions
        where_conditions = []
        query_params = []
        
        # Add department filter
        if department_id:
            where_conditions.append("p.department_id = ?")
            query_params.append(department_id)
        
        # Add search filter
        if search_query:
            search_condition = "(p.name LIKE ? OR p.description LIKE ? OR d.name LIKE ?)"
            where_conditions.append(search_condition)
            search_term = f"%{search_query}%"
            query_params.extend([search_term, search_term, search_term])
        
        # Combine WHERE conditions
        where_clause = ""
        if where_conditions:
            where_clause = "WHERE " + " AND ".join(where_conditions)
        
        # Count total products with filters
        count_query = f'''
            SELECT COUNT(*) as total
            FROM products p
            JOIN departments d ON p.department_id = d.id
            {where_clause}
        '''
        total_count = conn.execute(count_query, query_params).fetchone()['total']
        
        # Get paginated products with filters
        products_query = f'''
            SELECT p.id, p.name, p.price, p.description, d.name as department
            FROM products p
            JOIN departments d ON p.department_id = d.id
            {where_clause}
            ORDER BY p.id
            LIMIT ? OFFSET ?
        '''
        
        # Add pagination parameters to query_params
        final_params = query_params + [per_page, offset]
        products = conn.execute(products_query, final_params).fetchall()
        
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
        
        # Calculate pagination metadata
        total_pages = (total_count + per_page - 1) // per_page  # Ceiling division
        has_next = page < total_pages
        has_prev = page > 1
        
        # Return paginated response
        return jsonify({
            'products': products_list,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total_count,
                'total_pages': total_pages,
                'has_next': has_next,
                'has_prev': has_prev
            },
            'search': search_query,
            'department_id': department_id
        })
    
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