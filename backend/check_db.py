import sqlite3

conn = sqlite3.connect('c:\\Projects\\Websites\\Quranin Boarding School Management System\\backend\\instance\\dev.db')
c = conn.cursor()
c.execute("SELECT * FROM fee_invoices")
rows = c.fetchall()
print(f"Fee Invoices count in SQLite: {len(rows)}")
for r in rows:
    print(r)
conn.close()
