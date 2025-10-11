-- =====================================================
-- SCHEMAS SQL - PROJETO DOOF
-- =====================================================
-- Estrutura das tabelas SQL
-- Formato: MySQL/PostgreSQL

-- =====================================================
-- 1. TABELA: USERS
-- =====================================================

CREATE TABLE users (
    id VARCHAR(24) PRIMARY KEY DEFAULT (REPLACE(UUID(), '-', '')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(20),
    address_street VARCHAR(255),
    address_number VARCHAR(20),
    address_complement VARCHAR(255),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zipCode VARCHAR(20),
    role ENUM('customer', 'restaurant', 'admin') DEFAULT 'customer',
    avatar VARCHAR(500),
    auth_provider ENUM('local', 'google', 'facebook') DEFAULT 'local',
    provider_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_email_format CHECK (email REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
    CONSTRAINT chk_password_required CHECK (
        (auth_provider = 'local' AND password IS NOT NULL) OR 
        (auth_provider != 'local')
    ),
    
    -- Índices
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_auth_provider (auth_provider),
    INDEX idx_provider_id (provider_id)
);

-- =====================================================
-- 2. TABELA: RESTAURANTS
-- =====================================================

CREATE TABLE restaurants (
    id VARCHAR(24) PRIMARY KEY DEFAULT (REPLACE(UUID(), '-', '')),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    logo VARCHAR(500),
    banner VARCHAR(500),
    address_street VARCHAR(255) NOT NULL,
    address_number VARCHAR(20) NOT NULL,
    address_complement VARCHAR(255),
    address_neighborhood VARCHAR(100) NOT NULL,
    address_city VARCHAR(100) NOT NULL,
    address_state VARCHAR(50) NOT NULL,
    address_zipCode VARCHAR(20) NOT NULL,
    address_latitude DECIMAL(10, 8),
    address_longitude DECIMAL(11, 8),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    owner_id VARCHAR(24) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    minimum_order DECIMAL(10, 2) DEFAULT 0.00,
    average_delivery_time INT DEFAULT 40,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_restaurant_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_delivery_fee CHECK (delivery_fee >= 0),
    CONSTRAINT chk_minimum_order CHECK (minimum_order >= 0),
    CONSTRAINT chk_delivery_time CHECK (average_delivery_time >= 0),
    CONSTRAINT chk_rating CHECK (rating >= 0 AND rating <= 5),
    CONSTRAINT chk_total_reviews CHECK (total_reviews >= 0),
    CONSTRAINT chk_email_format_rest CHECK (email REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
    
    -- Índices
    INDEX idx_owner (owner_id),
    INDEX idx_city (address_city),
    INDEX idx_active (is_active),
    INDEX idx_rating (rating),
    INDEX idx_name (name),
    FULLTEXT idx_search (name, description)
);

-- =====================================================
-- 3. TABELA: RESTAURANT_CATEGORIES
-- =====================================================

CREATE TABLE restaurant_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id VARCHAR(24) NOT NULL,
    category VARCHAR(100) NOT NULL,
    
    -- Constraints
    CONSTRAINT fk_restaurant_category FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    CONSTRAINT unique_restaurant_category UNIQUE (restaurant_id, category),
    
    -- Índices
    INDEX idx_restaurant (restaurant_id),
    INDEX idx_category (category)
);

-- =====================================================
-- 4. TABELA: RESTAURANT_OPENING_HOURS
-- =====================================================

CREATE TABLE restaurant_opening_hours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id VARCHAR(24) NOT NULL,
    day_of_week TINYINT NOT NULL,
    open_time TIME,
    close_time TIME,
    closed BOOLEAN DEFAULT FALSE,
    
    -- Constraints
    CONSTRAINT fk_restaurant_hours FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    CONSTRAINT chk_day_of_week CHECK (day_of_week >= 0 AND day_of_week <= 6),
    CONSTRAINT chk_time_consistency CHECK (
        (closed = TRUE) OR 
        (closed = FALSE AND open_time IS NOT NULL AND close_time IS NOT NULL)
    ),
    
    -- Índices
    INDEX idx_restaurant_day (restaurant_id, day_of_week)
);

-- =====================================================
-- 5. TABELA: PRODUCTS
-- =====================================================

CREATE TABLE products (
    id VARCHAR(24) PRIMARY KEY DEFAULT (REPLACE(UUID(), '-', '')),
    restaurant_id VARCHAR(24) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(500),
    available BOOLEAN DEFAULT TRUE,
    preparation_time INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_product_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    CONSTRAINT chk_price CHECK (price >= 0),
    CONSTRAINT chk_preparation_time CHECK (preparation_time >= 0),
    
    -- Índices
    INDEX idx_restaurant (restaurant_id),
    INDEX idx_category (category),
    INDEX idx_available (available),
    INDEX idx_price (price),
    INDEX idx_name (name),
    FULLTEXT idx_search (name, description)
);

-- =====================================================
-- 6. TABELA: PRODUCT_INGREDIENTS
-- =====================================================

CREATE TABLE product_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(24) NOT NULL,
    ingredient VARCHAR(255) NOT NULL,
    
    -- Constraints
    CONSTRAINT fk_product_ingredient FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    -- Índices
    INDEX idx_product (product_id),
    INDEX idx_ingredient (ingredient)
);

-- =====================================================
-- 7. TABELA: PRODUCT_ALLERGENS
-- =====================================================

CREATE TABLE product_allergens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(24) NOT NULL,
    allergen VARCHAR(255) NOT NULL,
    
    -- Constraints
    CONSTRAINT fk_product_allergen FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    -- Índices
    INDEX idx_product (product_id),
    INDEX idx_allergen (allergen)
);

-- =====================================================
-- 8. TABELA: PRODUCT_NUTRITIONAL_INFO
-- =====================================================

CREATE TABLE product_nutritional_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(24) NOT NULL,
    calories INT,
    protein DECIMAL(5, 2),
    carbs DECIMAL(5, 2),
    fat DECIMAL(5, 2),
    
    -- Constraints
    CONSTRAINT fk_product_nutrition FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT unique_product_nutrition UNIQUE (product_id),
    CONSTRAINT chk_calories CHECK (calories >= 0),
    CONSTRAINT chk_protein CHECK (protein >= 0),
    CONSTRAINT chk_carbs CHECK (carbs >= 0),
    CONSTRAINT chk_fat CHECK (fat >= 0),
    
    -- Índices
    INDEX idx_product (product_id)
);

-- =====================================================
-- 9. TABELA: ORDERS
-- =====================================================

CREATE TABLE orders (
    id VARCHAR(24) PRIMARY KEY DEFAULT (REPLACE(UUID(), '-', '')),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(24) NOT NULL,
    restaurant_id VARCHAR(24) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'in_delivery', 'delivered', 'picked_up', 'cancelled') DEFAULT 'pending',
    delivery_type ENUM('delivery', 'pickup') NOT NULL,
    delivery_address_street VARCHAR(255),
    delivery_address_number VARCHAR(20),
    delivery_address_complement VARCHAR(255),
    delivery_address_neighborhood VARCHAR(100),
    delivery_address_city VARCHAR(100),
    delivery_address_state VARCHAR(50),
    delivery_address_zipCode VARCHAR(20),
    pickup_address_restaurant VARCHAR(500),
    pickup_address_instructions TEXT,
    payment_method ENUM('credit_card', 'debit_card', 'cash', 'pix') NOT NULL,
    estimated_delivery_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    CONSTRAINT chk_subtotal CHECK (subtotal >= 0),
    CONSTRAINT chk_delivery_fee_order CHECK (delivery_fee >= 0),
    CONSTRAINT chk_total CHECK (total >= 0),
    CONSTRAINT chk_total_calculation CHECK (total = subtotal + delivery_fee),
    CONSTRAINT chk_delivery_address CHECK (
        (delivery_type = 'delivery' AND delivery_address_street IS NOT NULL) OR
        (delivery_type = 'pickup')
    ),
    CONSTRAINT chk_pickup_address CHECK (
        (delivery_type = 'pickup' AND pickup_address_restaurant IS NOT NULL) OR
        (delivery_type = 'delivery')
    ),
    
    -- Índices
    INDEX idx_customer (customer_id),
    INDEX idx_restaurant (restaurant_id),
    INDEX idx_status (status),
    INDEX idx_order_number (order_number),
    INDEX idx_created_at (created_at),
    INDEX idx_customer_status (customer_id, status),
    INDEX idx_restaurant_status (restaurant_id, status)
);

-- =====================================================
-- 10. TABELA: ORDER_ITEMS
-- =====================================================

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(24) NOT NULL,
    product_id VARCHAR(24) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    notes TEXT,
    
    -- Constraints
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT chk_quantity CHECK (quantity >= 1),
    CONSTRAINT chk_price_item CHECK (price >= 0),
    
    -- Índices
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- =====================================================
-- 11. TABELA: ORDER_STATUS_HISTORY
-- =====================================================

CREATE TABLE order_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(24) NOT NULL,
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'in_delivery', 'delivered', 'picked_up', 'cancelled') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    
    -- Constraints
    CONSTRAINT fk_status_history_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Índices
    INDEX idx_order (order_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_status (status)
);


