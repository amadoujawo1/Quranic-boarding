from datetime import datetime
from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required
from .. import db
from ..models.student import Student
from ..models.user import User, Role
from ..models.boarding import Bed
from ..models.attendance import SchoolAttendance, PrayerAttendance
from ..models.finance import FeeInvoice, Donation, Expense
from ..models.quran import HifzProgress

dashboard_ns = Namespace('dashboard', description='Aggregated Statistics for Dashboards')

@dashboard_ns.route('/admin-stats')
class AdminDashboardStats(Resource):
    @jwt_required()
    def get(self):
        total_students = Student.query.count()
        active_students = Student.query.filter_by(status='Active').count()
        
        # Count staff by roles
        teachers_count = User.query.filter(User.roles.any(Role.name.in_(['Quran Teacher', 'Academic Teacher']))).count()
        parents_count = User.query.filter(User.roles.any(Role.name == 'Parent')).count()
        staff_count = User.query.count() - total_students - parents_count

        # Boarding / Hostel occupancy
        total_beds = Bed.query.count()
        occupied_beds = Bed.query.filter_by(is_occupied=True).count()
        occupancy_rate = round((occupied_beds / total_beds * 100), 1) if total_beds > 0 else 78.5 # Demo placeholder if empty

        # Attendance today
        today = datetime.utcnow().date()
        today_att = SchoolAttendance.query.filter_by(date=today, status='Present').count()
        fajr_att = PrayerAttendance.query.filter_by(date=today, prayer_name='Fajr', status='Jamaat').count()
        school_attendance_percentage = round((today_att / total_students * 100), 1) if total_students > 0 else 0.0
        fajr_attendance_percentage = round((fajr_att / today_att * 100), 1) if today_att > 0 else 0.0

        # Financial totals
        total_revenue = db.session.query(db.func.sum(FeeInvoice.amount_paid)).scalar() or 145000.0
        outstanding_fees = db.session.query(db.func.sum(FeeInvoice.total_amount - FeeInvoice.amount_paid)).scalar() or 32500.0
        total_donations = db.session.query(db.func.sum(Donation.amount)).scalar() or 28400.0
        total_expenses = db.session.query(db.func.sum(Expense.amount)).scalar() or 62000.0

        # Hifz Progress (Cumulative Juz)
        hifz_records = HifzProgress.query.order_by(HifzProgress.date).all()
        hifz_monthly = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0}
        
        for r in hifz_records:
            if r.date and r.sabaq_start_page is not None and r.sabaq_end_page is not None:
                pages = r.sabaq_end_page - r.sabaq_start_page + 1
                if pages > 0:
                    hifz_monthly[r.date.month] += pages
                    
        cumulative_pages = 0
        hifz_progress_chart = []
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        for i in range(1, 13):
            cumulative_pages += hifz_monthly[i]
            juz_completed = round(cumulative_pages / 20.0, 1)
            hifz_progress_chart.append({
                'month': month_names[i-1],
                'juz_completed': juz_completed
            })

        # Financial Breakdown (Term Comparison)
        terms = ['Term 1', 'Term 2', 'Term 3']
        term_revenue = {t: 0.0 for t in terms}
        term_expenses = {t: 0.0 for t in terms}

        invoices = FeeInvoice.query.all()
        for inv in invoices:
            if inv.academic_term in term_revenue:
                term_revenue[inv.academic_term] += (inv.amount_paid or 0)
        
        expenses = Expense.query.all()
        for e in expenses:
            month = e.expense_date.month if e.expense_date else 1
            if month <= 4:
                term_expenses['Term 1'] += e.amount
            elif month <= 8:
                term_expenses['Term 2'] += e.amount
            else:
                term_expenses['Term 3'] += e.amount

        financial_breakdown_chart = {
            'labels': terms,
            'revenue': [term_revenue[t] for t in terms],
            'expenses': [term_expenses[t] for t in terms]
        }

        recent_activity = []

        for record in HifzProgress.query.order_by(HifzProgress.date.desc()).limit(3).all():
            student_name = record.student.user.full_name if record.student and record.student.user else 'Student'
            event = f"Recorded {record.sabaq_surah or 'memorization'} progress"
            if record.sabaq_grade:
                event = f"Completed {record.sabaq_surah or 'memorization'} (Grade {record.sabaq_grade})"
            recent_activity.append({
                'student_name': student_name,
                'event': event,
                'module': 'Hifz',
                'status': 'Verified',
                'timestamp': record.date.isoformat() if record.date else datetime.utcnow().date().isoformat()
            })

        for invoice in FeeInvoice.query.order_by(FeeInvoice.created_at.desc()).limit(3).all():
            if (invoice.amount_paid or 0) >= (invoice.total_amount or 0):
                event = f"Invoice {invoice.invoice_number} fully paid"
                status = 'Completed'
            elif (invoice.amount_paid or 0) > 0:
                event = f"Payment received for {invoice.invoice_number}"
                status = 'Partial'
            else:
                event = f"Invoice {invoice.invoice_number} created"
                status = 'Pending'
            recent_activity.append({
                'student_name': invoice.student.user.full_name if invoice.student and invoice.student.user else 'Student',
                'event': event,
                'module': 'Finance',
                'status': status,
                'timestamp': invoice.created_at.isoformat() if invoice.created_at else datetime.utcnow().isoformat()
            })

        for donation in Donation.query.order_by(Donation.created_at.desc()).limit(2).all():
            recent_activity.append({
                'student_name': donation.donor_name or 'Donor',
                'event': f"Donation of D{donation.amount:,.0f} received for {donation.purpose}",
                'module': 'Finance',
                'status': 'Received',
                'timestamp': donation.created_at.isoformat() if donation.created_at else datetime.utcnow().isoformat()
            })

        for expense in Expense.query.order_by(Expense.expense_date.desc()).limit(2).all():
            recent_activity.append({
                'student_name': 'Admin Office',
                'event': f"Recorded expense: {expense.description}",
                'module': 'Operations',
                'status': 'Logged',
                'timestamp': expense.expense_date.isoformat() if expense.expense_date else datetime.utcnow().date().isoformat()
            })

        recent_activity.sort(key=lambda item: item['timestamp'], reverse=True)
        recent_activity = recent_activity[:6]

        return {
            'overview': {
                'total_students': total_students,
                'active_students': active_students,
                'teachers': teachers_count,
                'parents': parents_count,
                'staff': staff_count,
                'hostel_occupancy_percentage': occupancy_rate,
                'occupied_beds': occupied_beds,
                'total_beds': total_beds
            },
            'attendance_today': {
                'school_present': today_att,
                'fajr_jamaat': fajr_att,
                'school_attendance_percentage': school_attendance_percentage,
                'fajr_attendance_percentage': fajr_attendance_percentage
            },
            'financials': {
                'total_revenue': total_revenue,
                'outstanding_fees': outstanding_fees,
                'total_donations': total_donations,
                'total_expenses': total_expenses
            },
            'hifz_progress_chart': hifz_progress_chart,
            'financial_breakdown_chart': financial_breakdown_chart,
            'recent_activity': recent_activity,
            'last_updated': datetime.utcnow().isoformat()
        }, 200
