import os
import pymysql
from app import create_app, db
from app.models.finance import FeeInvoice, FeePayment, Payroll, Donation, Expense

os.environ['DATABASE_URL'] = 'mysql+pymysql://root:rootpassword@127.0.0.1:3306/qbsms_db'
app = create_app()

with app.app_context():
    try:
        invoice = FeeInvoice.query.filter_by(invoice_number="INV-2026-03").first()
        if invoice:
            FeePayment.query.filter_by(invoice_id=invoice.id).delete()
            db.session.delete(invoice)
            db.session.commit()
            print("Successfully deleted invoice INV-2026-03 from MySQL database.")
        else:
            print("Invoice INV-2026-03 not found in MySQL database.")
            
        # Also clean all other financial entries to complete the previous request
        num_payments = db.session.query(FeePayment).delete()
        num_invoices = db.session.query(FeeInvoice).delete()
        num_payrolls = db.session.query(Payroll).delete()
        num_donations = db.session.query(Donation).delete()
        num_expenses = db.session.query(Expense).delete()
        
        db.session.commit()
        print(f"Deleted {num_payments} payments, {num_invoices} invoices, {num_payrolls} payrolls, {num_donations} donations, {num_expenses} expenses from MySQL database.")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error occurred with MySQL: {e}")
