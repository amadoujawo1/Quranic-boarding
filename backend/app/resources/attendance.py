from datetime import datetime
from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required
from .. import db
from ..models.student import Student
from ..models.user import User
from ..models.attendance import SchoolAttendance, HostelAttendance, PrayerAttendance, MealAttendance

attendance_ns = Namespace('attendance', description='School, Hostel, Prayer & Meal Attendance')


def _get_active_students():
    """Retrieve active and enrolled students joined with user details."""
    students = (
        Student.query
        .join(User, Student.user_id == User.id, isouter=True)
        .filter(Student.status.in_(['Active', 'Enrolled']))
        .order_by(Student.student_id_number.asc())
        .all()
    )
    if not students:
        # Fallback to non-graduated students or all students
        students = (
            Student.query
            .join(User, Student.user_id == User.id, isouter=True)
            .filter(Student.status != 'Graduated')
            .order_by(Student.student_id_number.asc())
            .all()
        )
    return students


@attendance_ns.route('/school')
class SchoolAttendanceResource(Resource):
    @jwt_required()
    def get(self):
        date_str = request.args.get('date')
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                target_date = datetime.utcnow().date()
        else:
            target_date = datetime.utcnow().date()

        # Get all active students
        students = _get_active_students()

        # Get existing attendance records for target_date
        records = SchoolAttendance.query.filter_by(date=target_date).all()
        record_map = {r.student_id: r for r in records}

        result = []
        present_count = 0
        absent_count = 0
        late_count = 0
        excused_count = 0

        for s in students:
            rec = record_map.get(s.id)
            if rec:
                status = rec.status
                remarks = rec.remarks or ''
                attendance_id = rec.id
                is_recorded = True
            else:
                # Default status is Present if not yet logged
                status = 'Present'
                remarks = ''
                attendance_id = None
                is_recorded = False

            if status == 'Present':
                present_count += 1
            elif status == 'Late':
                late_count += 1
            elif status == 'Absent':
                absent_count += 1
            elif status == 'Excused':
                excused_count += 1

            full_name = s.user.full_name if s.user else f"Student {s.student_id_number}"

            result.append({
                'id': attendance_id,
                'student_id': s.id,
                'student_id_number': s.student_id_number,
                'full_name': full_name,
                'gender': s.gender,
                'date': target_date.isoformat(),
                'status': status,
                'remarks': remarks,
                'is_recorded': is_recorded
            })

        total_students = len(students)
        effective_present = present_count + late_count
        attendance_percentage = round((effective_present / total_students * 100), 1) if total_students > 0 else 0.0

        return {
            'date': target_date.isoformat(),
            'total_students': total_students,
            'present_count': present_count,
            'late_count': late_count,
            'absent_count': absent_count,
            'excused_count': excused_count,
            'attendance_percentage': attendance_percentage,
            'students': result
        }, 200

    @jwt_required()
    def post(self):
        data = request.get_json() or {}
        date_str = data.get('date')
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                target_date = datetime.utcnow().date()
        else:
            target_date = datetime.utcnow().date()

        logs = data.get('logs', [])
        if not logs:
            return {'message': 'No attendance logs provided'}, 400

        updated_or_created = 0
        for item in logs:
            sid = item.get('student_id')
            if not sid:
                continue

            status = item.get('status', 'Present')
            remarks = item.get('remarks', '')

            rec = SchoolAttendance.query.filter_by(student_id=sid, date=target_date).first()
            if rec:
                rec.status = status
                rec.remarks = remarks
            else:
                rec = SchoolAttendance(
                    student_id=sid,
                    date=target_date,
                    status=status,
                    remarks=remarks
                )
                db.session.add(rec)
            updated_or_created += 1

        db.session.commit()
        return {
            'message': f'Successfully recorded school attendance for {updated_or_created} students',
            'count': updated_or_created,
            'date': target_date.isoformat()
        }, 200


@attendance_ns.route('/prayer')
class PrayerAttendanceResource(Resource):
    @jwt_required()
    def get(self):
        date_str = request.args.get('date')
        prayer_name = request.args.get('prayer_name', 'Fajr')

        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                target_date = datetime.utcnow().date()
        else:
            target_date = datetime.utcnow().date()

        students = _get_active_students()
        records = PrayerAttendance.query.filter_by(date=target_date, prayer_name=prayer_name).all()
        record_map = {r.student_id: r for r in records}

        result = []
        jamaat_count = 0
        late_count = 0
        absent_count = 0
        excused_count = 0

        for s in students:
            rec = record_map.get(s.id)
            if rec:
                status = rec.status
                remarks = rec.remarks or ''
                attendance_id = rec.id
                is_recorded = True
            else:
                status = 'Jamaat'
                remarks = ''
                attendance_id = None
                is_recorded = False

            if status == 'Jamaat':
                jamaat_count += 1
            elif status == 'Late':
                late_count += 1
            elif status == 'Absent':
                absent_count += 1
            elif status == 'Excused':
                excused_count += 1

            full_name = s.user.full_name if s.user else f"Student {s.student_id_number}"

            result.append({
                'id': attendance_id,
                'student_id': s.id,
                'student_id_number': s.student_id_number,
                'full_name': full_name,
                'gender': s.gender,
                'date': target_date.isoformat(),
                'prayer_name': prayer_name,
                'status': status,
                'remarks': remarks,
                'is_recorded': is_recorded
            })

        total_students = len(students)
        jamaat_percentage = round((jamaat_count / total_students * 100), 1) if total_students > 0 else 0.0

        return {
            'date': target_date.isoformat(),
            'prayer_name': prayer_name,
            'total_students': total_students,
            'jamaat_count': jamaat_count,
            'late_count': late_count,
            'absent_count': absent_count,
            'excused_count': excused_count,
            'jamaat_percentage': jamaat_percentage,
            'students': result
        }, 200

    @jwt_required()
    def post(self):
        data = request.get_json() or {}
        date_str = data.get('date')
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                target_date = datetime.utcnow().date()
        else:
            target_date = datetime.utcnow().date()

        prayer = data.get('prayer_name', 'Fajr')
        logs = data.get('logs', [])

        if not logs:
            return {'message': 'No prayer attendance logs provided'}, 400

        updated_or_created = 0
        for item in logs:
            sid = item.get('student_id')
            if not sid:
                continue

            status = item.get('status', 'Jamaat')
            remarks = item.get('remarks', '')

            rec = PrayerAttendance.query.filter_by(student_id=sid, date=target_date, prayer_name=prayer).first()
            if rec:
                rec.status = status
                rec.remarks = remarks
            else:
                rec = PrayerAttendance(
                    student_id=sid,
                    date=target_date,
                    prayer_name=prayer,
                    status=status,
                    remarks=remarks
                )
                db.session.add(rec)
            updated_or_created += 1

        db.session.commit()
        return {
            'message': f'Successfully recorded {prayer} prayer attendance for {updated_or_created} students',
            'count': updated_or_created,
            'date': target_date.isoformat(),
            'prayer_name': prayer
        }, 200


@attendance_ns.route('/today-summary')
class AttendanceSummaryResource(Resource):
    @jwt_required()
    def get(self):
        today = datetime.utcnow().date()
        students = _get_active_students()
        total_enrolled = len(students)

        today_school_present = SchoolAttendance.query.filter_by(date=today, status='Present').count()
        today_school_late = SchoolAttendance.query.filter_by(date=today, status='Late').count()
        effective_school_present = today_school_present + today_school_late
        school_percentage = round((effective_school_present / total_enrolled * 100), 1) if total_enrolled > 0 else 0.0

        fajr_jamaat = PrayerAttendance.query.filter_by(date=today, prayer_name='Fajr', status='Jamaat').count()
        fajr_percentage = round((fajr_jamaat / total_enrolled * 100), 1) if total_enrolled > 0 else 0.0

        return {
            'date': today.isoformat(),
            'total_enrolled': total_enrolled,
            'school_present': effective_school_present,
            'school_attendance_percentage': school_percentage,
            'fajr_jamaat': fajr_jamaat,
            'fajr_attendance_percentage': fajr_percentage
        }, 200
