import os
import sys

# Add backend to path so we can import app
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app import create_app, db
from backend.app.models.finance import FeeInvoice

app = create_app()
with app.app_context():
    invoices = FeeInvoice.query.all()
    print("Invoices found:", len(invoices))
    for inv in invoices:
        print(inv.invoice_number, inv.student.user.full_name if inv.student else "No student", inv.total_amount)
