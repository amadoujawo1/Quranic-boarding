from datetime import datetime
from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt
from .. import db
from ..models.quran import HifzProgress, TajweedEvaluation
from ..models.student import Student

hifz_ns = Namespace('hifz', description='Quran Memorization (Hifz) & Tajweed Progress Tracking')

@hifz_ns.route('/records')
class HifzRecordList(Resource):
    @jwt_required()
    def get(self):
        student_id = request.args.get('student_id', type=int)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        query = HifzProgress.query
        if student_id:
            query = query.filter_by(student_id=student_id)
        
        pagination = query.order_by(HifzProgress.date.desc()).paginate(page=page, per_page=per_page, error_out=False)
        return {
            'records': [r.to_dict() for r in pagination.items],
            'total': pagination.total,
            'page': page,
            'pages': pagination.pages
        }, 200

    @jwt_required()
    def post(self):
        data = request.get_json() or {}
        claims = get_jwt()
        teacher_id = claims.get('user_id')

        sabaq = data.get('sabaq', {})
        sabqi = data.get('sabqi', {})
        manzil = data.get('manzil', {})

        record = HifzProgress(
            student_id=data.get('student_id'),
            teacher_id=teacher_id,
            date=datetime.strptime(data.get('date'), '%Y-%m-%d').date() if data.get('date') else datetime.utcnow().date(),
            sabaq_surah=sabaq.get('surah'),
            sabaq_juz=sabaq.get('juz'),
            sabaq_start_page=sabaq.get('start_page'),
            sabaq_end_page=sabaq.get('end_page'),
            sabaq_grade=sabaq.get('grade', 'A'),
            sabqi_juz=sabqi.get('juz'),
            sabqi_pages=sabqi.get('pages'),
            sabqi_grade=sabqi.get('grade', 'A'),
            manzil_juz=manzil.get('juz'),
            manzil_pages=manzil.get('pages'),
            manzil_grade=manzil.get('grade', 'A'),
            teacher_notes=data.get('teacher_notes')
        )
        db.session.add(record)
        db.session.commit()
        return record.to_dict(), 201

@hifz_ns.route('/student/<int:student_id>/summary')
class HifzStudentSummary(Resource):
    @jwt_required()
    def get(self, student_id):
        student = Student.query.get_or_404(student_id)
        records = HifzProgress.query.filter_by(student_id=student_id).order_by(HifzProgress.date.asc()).all()
        
        # Calculate summary statistics
        total_records = len(records)
        latest_sabaq = records[-1].to_dict() if records else None
        
        # Calculate approximate total completed Juz
        highest_juz = max([r.sabaq_juz for r in records if r.sabaq_juz] or [0])

        return {
            'student_id': student_id,
            'student_name': student.user.full_name if student.user else '',
            'total_entries': total_records,
            'highest_completed_juz': highest_juz,
            'latest_record': latest_sabaq
        }, 200
