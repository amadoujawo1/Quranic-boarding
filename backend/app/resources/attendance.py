from datetime import datetime
from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required
from .. import db
from ..models.attendance import SchoolAttendance, HostelAttendance, PrayerAttendance, MealAttendance

attendance_ns = Namespace('attendance', description='School, Hostel, Prayer & Meal Attendance')

@attendance_ns.route('/prayer')
class PrayerAttendanceResource(Resource):
    @jwt_required()
    def get(self):
        date_str = request.args.get('date')
        prayer_name = request.args.get('prayer_name')
        
        query = PrayerAttendance.query
        if date_str:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            query = query.filter_by(date=target_date)
        if prayer_name:
            query = query.filter_by(prayer_name=prayer_name)

        records = query.all()
        return [{
            'id': r.id,
            'student_id': r.student_id,
            'date': r.date.isoformat(),
            'prayer_name': r.prayer_name,
            'status': r.status,
            'remarks': r.remarks
        } for r in records], 200

    @jwt_required()
    def post(self):
        data = request.get_json() or {}
        # Bulk log attendance: list of {student_id, status}
        logs = data.get('logs', [])
        date_obj = datetime.strptime(data.get('date'), '%Y-%m-%d').date() if data.get('date') else datetime.utcnow().date()
        prayer = data.get('prayer_name', 'Fajr')

        created_records = []
        for item in logs:
            record = PrayerAttendance(
                student_id=item.get('student_id'),
                date=date_obj,
                prayer_name=prayer,
                status=item.get('status', 'Jamaat'),
                remarks=item.get('remarks')
            )
            db.session.add(record)
            created_records.append(record)
        db.session.commit()
        return {'message': f'Logged {len(created_records)} prayer attendance records'}, 201
