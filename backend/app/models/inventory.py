from datetime import datetime
from .. import db

class InventoryItem(db.Model):
    __tablename__ = 'inventory_items'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(100), nullable=False) # Computer, Furniture, Kitchen Equipment, Cleaning Supplies, Lab Equipment, Uniform
    quantity = db.Column(db.Integer, default=0)
    unit = db.Column(db.String(30), default='Pcs')
    location = db.Column(db.String(100))
    min_threshold = db.Column(db.Integer, default=5)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class Book(db.Model):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(150))
    isbn_barcode = db.Column(db.String(100), unique=True, index=True)
    category = db.Column(db.String(100)) # Tafsir, Hadith, Fiqh, General Literature
    total_copies = db.Column(db.Integer, default=1)
    available_copies = db.Column(db.Integer, default=1)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class BookBorrowing(db.Model):
    __tablename__ = 'book_borrowings'

    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id', ondelete='CASCADE'), nullable=False)
    borrower_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    borrowed_at = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.Date, nullable=False)
    returned_at = db.Column(db.DateTime, nullable=True)
    fine_amount = db.Column(db.Float, default=0.0)

    book = db.relationship('Book', backref=db.backref('borrowings', lazy='dynamic'))
    borrower = db.relationship('User')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class Vehicle(db.Model):
    __tablename__ = 'vehicles'

    id = db.Column(db.Integer, primary_key=True)
    registration_number = db.Column(db.String(50), unique=True, nullable=False) # e.g. QBS-BUS-01
    model_name = db.Column(db.String(100))
    driver_name = db.Column(db.String(150))
    driver_phone = db.Column(db.String(30))
    capacity = db.Column(db.Integer, default=30)
    route_description = db.Column(db.Text)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
