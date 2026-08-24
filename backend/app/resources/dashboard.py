from datetime import datetime
from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required
from .. import db
from ..models.student import Student, Alumni
from ..models.user import User, Role
from ..models.boarding import Bed
from ..models.attendance import SchoolAttendance, PrayerAttendance
from ..models.finance import FeeInvoice, Donation, Expense, StudentPayment
from ..models.quran import HifzProgress

dashboard_ns = Namespace('dashboard', description='Aggregated Statistics for Dashboards')


def build_overview_stats():
    total_students_all = Student.query.count()
    active_students = Student.query.filter_by(status='Active').count()
    enrolled_students = Student.query.filter(Student.status.in_(['Active', 'Enrolled'])).count()

    if enrolled_students == 0:
        enrolled_students = Student.query.filter(Student.status != 'Graduated').count()
    if enrolled_students == 0:
        enrolled_students = total_students_all

    teachers_count = User.query.filter(
        User.roles.any(Role.name.in_(['Quran Teacher', 'Academic Teacher']))
    ).count()
    parents_count = User.query.filter(User.roles.any(Role.name == 'Parent')).count()
    staff_count = max(0, User.query.count() - total_students_all - parents_count)

    total_beds = Bed.query.count()
    occupied_beds = Bed.query.filter_by(is_occupied=True).count()
    occupancy_rate = round((occupied_beds / total_beds * 100), 1) if total_beds > 0 else 0.0

    hifz_graduates = Alumni.query.filter(Alumni.hifz_completion_date.isnot(None)).count()
    if hifz_graduates == 0:
        hifz_graduates = Student.query.filter_by(status='Graduated').count()

    return {
        'total_students': enrolled_students if enrolled_students > 0 else total_students_all,
        'total_enrolled_students': enrolled_students if enrolled_students > 0 else total_students_all,
        'active_students': active_students if active_students > 0 else enrolled_students,
        'all_time_students': total_students_all,
        'teachers': teachers_count,
        'parents': parents_count,
        'staff': staff_count,
        'hostel_occupancy_percentage': occupancy_rate,
        'occupied_beds': occupied_beds,
        'total_beds': total_beds,
        'hifz_graduates': hifz_graduates
    }


@dashboard_ns.route('/public-stats')
class PublicDashboardStats(Resource):
    def get(self):
        overview = build_overview_stats()
        return {
            'overview': {
                'total_students': overview['total_enrolled_students'],
                'hifz_graduates': overview['hifz_graduates'],
                'teachers': overview['teachers'],
                'total_beds': overview['total_beds']
            },
            'last_updated': datetime.utcnow().isoformat()
        }, 200

@dashboard_ns.route('/admin-stats')
class AdminDashboardStats(Resource):
    @jwt_required()
    def get(self):
        overview = build_overview_stats()
        total_students = overview['total_enrolled_students'] or overview['total_students']
        today = datetime.utcnow().date()

        # Attendance today
        today_school_present = SchoolAttendance.query.filter_by(date=today, status='Present').count()
        today_school_late = SchoolAttendance.query.filter_by(date=today, status='Late').count()
        today_att = today_school_present + today_school_late

        fajr_att = PrayerAttendance.query.filter_by(date=today, prayer_name='Fajr', status='Jamaat').count()

        has_today_school_records = SchoolAttendance.query.filter_by(date=today).count() > 0
        has_today_prayer_records = PrayerAttendance.query.filter_by(date=today, prayer_name='Fajr').count() > 0

        if has_today_school_records and total_students > 0:
            school_attendance_percentage = round((today_att / total_students * 100), 1)
        elif not has_today_school_records:
            latest_school_date = db.session.query(db.func.max(SchoolAttendance.date)).scalar()
            if latest_school_date:
                latest_present = SchoolAttendance.query.filter(
                    SchoolAttendance.date == latest_school_date,
                    SchoolAttendance.status.in_(['Present', 'Late'])
                ).count()
                today_att = latest_present
                school_attendance_percentage = round((latest_present / total_students * 100), 1) if total_students > 0 else 0.0
            else:
                today_att = 0
                school_attendance_percentage = 0.0
        else:
            school_attendance_percentage = 0.0

        if has_today_prayer_records and today_att > 0:
            fajr_attendance_percentage = round((fajr_att / today_att * 100), 1)
        elif not has_today_prayer_records:
            latest_prayer_date = db.session.query(db.func.max(PrayerAttendance.date)).scalar()
            if latest_prayer_date:
                latest_fajr = PrayerAttendance.query.filter_by(date=latest_prayer_date, prayer_name='Fajr', status='Jamaat').count()
                fajr_att = latest_fajr
                fajr_attendance_percentage = round((fajr_att / total_students * 100), 1) if total_students > 0 else 0.0
            else:
                fajr_att = 0
                fajr_attendance_percentage = 0.0
        else:
            fajr_attendance_percentage = 0.0

        # Financial totals
        sp_revenue = db.session.query(db.func.sum(StudentPayment.amount_paid)).scalar() or 0.0
        sp_outstanding = db.session.query(db.func.sum(StudentPayment.balance)).scalar() or 0.0
        fi_revenue = db.session.query(db.func.sum(FeeInvoice.amount_paid)).scalar() or 0.0
        fi_outstanding = db.session.query(db.func.sum(FeeInvoice.total_amount - FeeInvoice.amount_paid)).scalar() or 0.0

        total_revenue = sp_revenue if sp_revenue > 0 else fi_revenue
        outstanding_fees = sp_outstanding if sp_outstanding > 0 else max(0.0, fi_outstanding)
        total_donations = db.session.query(db.func.sum(Donation.amount)).scalar() or 0.0
        total_expenses = db.session.query(db.func.sum(Expense.amount)).scalar() or 0.0

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

        # Check payments / invoices
        payments = StudentPayment.query.all()
        if payments:
            for p in payments:
                month = p.payment_date.month if p.payment_date else 8
                if month <= 4:
                    term_revenue['Term 1'] += (p.amount_paid or 0)
                elif month <= 8:
                    term_revenue['Term 2'] += (p.amount_paid or 0)
                else:
                    term_revenue['Term 3'] += (p.amount_paid or 0)
        else:
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

        for payment in StudentPayment.query.order_by(StudentPayment.payment_date.desc(), StudentPayment.id.desc()).limit(3).all():
            student_name = payment.student.user.full_name if payment.student and payment.student.user else 'Student'
            status = 'Completed' if payment.status == 'Paid' else 'Partial' if payment.status == 'Partial' else 'Pending'
            recent_activity.append({
                'student_name': student_name,
                'event': f"Payment of D{payment.amount_paid:,.0f} ({payment.payment_month})",
                'module': 'Finance',
                'status': status,
                'timestamp': payment.payment_date.isoformat() if payment.payment_date else datetime.utcnow().date().isoformat()
            })

        for invoice in FeeInvoice.query.order_by(FeeInvoice.created_at.desc()).limit(2).all():
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
                **overview
            },
            'attendance_today': {
                'school_present': today_att,
                'total_enrolled': total_students,
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
