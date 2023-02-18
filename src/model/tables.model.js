const { db } = require("../services/db.service")

function Tables() {
    this.db = db
    this.create()
}

Tables.prototype.create = async function() {
    let query
    let result
    
 

    query = `CREATE TABLE IF NOT EXISTS Store(
        id SERIAL PRIMARY KEY,
        name CHARACTER VARYING(255) NOT NULL,
        email CHARACTER VARYING(100) NOT NULL,
        cnpj CHARACTER VARYING(18) NOT NULL,
        address CHARACTER VARYING(255) NOT NULL,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )`
    await this.db.query(query)

    query = `CREATE TABLE IF NOT EXISTS Users(
        id SERIAL PRIMARY KEY,
        name CHARACTER VARYING(250) NOT NULL,
        email CHARACTER VARYING(100) NOT NULL,
        password CHARACTER VARYING(255) NOT NULL,
        role INT,
        store_id INT NOT NULL REFERENCES Store(id) ON DELETE CASCADE,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )`    
    await this.db.query(query)

    query = `CREATE TABLE IF NOT EXISTS Client(
        id SERIAL PRIMARY KEY,
        name CHARACTER VARYING(250) NOT NULL,
        email CHARACTER VARYING(100) NOT NULL,
        cpf CHARACTER VARYING(11) NOT NULL,
        phone_number CHARACTER VARYING(20) NOT NULL,
        store_id INT NOT NULL REFERENCES Store(id) ON DELETE CASCADE,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )`    
    await this.db.query(query)

    query = `CREATE TABLE IF NOT EXISTS client_address(
        id SERIAL PRIMARY KEY,
        address CHARACTER VARYING(250) NOT NULL,
        city CHARACTER VARYING(100) NOT NULL,
        state CHARACTER VARYING(100) NOT NULL,
        zip_code CHARACTER VARYING(20) NOT NULL,
        country CHARACTER VARYING(100) NOT NULL,
        client_id INT NOT NULL REFERENCES Client(id) ON DELETE CASCADE,
        store_id INT NOT NULL REFERENCES Store(id) ON DELETE CASCADE,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )`    
    await this.db.query(query)

    query = `CREATE TABLE IF NOT EXISTS Payment_method(
        id SERIAL PRIMARY KEY,
        name CHARACTER VARYING(150) NOT NULL,
        description CHARACTER VARYING(250),
        store_id INT NOT NULL REFERENCES Store(id),
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )`
    await this.db.query(query)

    query = `CREATE TABLE IF NOT EXISTS Category(
        id SERIAL PRIMARY KEY,
        name CHARACTER VARYING(150) NOT NULL,
        description CHARACTER VARYING(250),
        store_id INT NOT NULL REFERENCES Store(id),
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )`
    await this.db.query(query)

    query = `CREATE TABLE IF NOT EXISTS Product(
        id SERIAL PRIMARY KEY,
        name CHARACTER VARYING(150),
        description CHARACTER VARYING(150),
        active BOOLEAN,
        discount DECIMAL,
        category_id INT NOT NULL REFERENCES Category(id),
        store_id INT NOT NULL REFERENCES Store(id),
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )`
    await this.db.query(query)


    query = `CREATE TABLE IF NOT EXISTS Sku(
        id SERIAL PRIMARY KEY,
        name CHARACTER VARYING(150) NOT NULL,
        description CHARACTER VARYING(150),
        active BOOLEAN,
        price NUMERIC(7, 2),
        product_id INT NOT NULL REFERENCES Product(id),
        store_id INT NOT NULL REFERENCES Store(id),
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )`
    await this.db.query(query)


    query = `CREATE TABLE IF NOT EXISTS Sku_image(
        id SERIAL PRIMARY KEY,
        name CHARACTER VARYING(150),
        path CHARACTER VARYING(250),
        sku_id INT NOT NULL REFERENCES Sku(id) ON DELETE CASCADE,
        store_id INT NOT NULL REFERENCES Store(id) ON DELETE CASCADE,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )`
    await this.db.query(query)

    
    query = `CREATE TABLE IF NOT EXISTS Sku_inventory(
        id SERIAL PRIMARY KEY,
        quantity INT,
        sku_id INT NOT NULL REFERENCES Sku(id) ON DELETE CASCADE,
        store_id INT NOT NULL REFERENCES Store(id) ON DELETE CASCADE,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )`
    await this.db.query(query)
    
    query = `CREATE TABLE IF NOT EXISTS Orders(
        id SERIAL PRIMARY KEY,
        total NUMERIC(9, 2),
        status INT,
        delivery_status INT,
        payment_method_id INT REFERENCES Payment_method(id),
        client_id INT REFERENCES Client(id),
        store_id INT NOT NULL REFERENCES Store(id),
        canceled BOOLEAN,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )`
    await this.db.query(query)

    query = `CREATE TABLE IF NOT EXISTS Order_item(
        id SERIAL PRIMARY KEY,
        quantity INT,
        order_id INT NOT NULL REFERENCES Orders(id) ON DELETE CASCADE,
        sku_id INT NOT NULL REFERENCES Sku(id),
        store_id INT NOT NULL REFERENCES Store(id) ON DELETE CASCADE,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )`
    await this.db.query(query)

    query = `CREATE TABLE IF NOT EXISTS Uploads(
        id SERIAL PRIMARY KEY,
        name CHARACTER VARYING(150),
        path CHARACTER VARYING(500),
        store_id INT NOT NULL REFERENCES Store(id) ON DELETE CASCADE,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    )`
    await this.db.query(query)
    
    query = `CREATE TABLE IF NOT EXISTS configs(
        id SERIAL PRIMARY KEY,
        email_host CHARACTER VARYING(150),
        email_port INT,
        email_username CHARACTER VARYING(250),
        email_password CHARACTER VARYING(250),
        store_id INT NOT NULL REFERENCES Store(id) ON DELETE CASCADE
    )`
    await this.db.query(query)
}


module.exports = new Tables