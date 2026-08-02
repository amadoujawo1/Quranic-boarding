from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required
from .. import db
from ..models.academic import ClassGroup, Subject, Timetable, Homework, Exam, Grade

academic_ns = Namespace('academic', description='Classes, Subjects, Exams and Academic Records')

@academic_ns.route('/classes')
class ClassList(Resource):
    @jwt_required()
    def get(self):
        classes = ClassGroup.query.all()
        return [c.to_dict() for c in classes], 200

    @jwt_required()
    def post(self):
        data = request.get_json() or {}
        cg = ClassGroup(
            name=data.get('name'),
            code=data.get('code'),
            academic_year=data.get('academic_year', '2026/2027')
        )
        db.session.add(cg)
        db.session.commit()
        return cg.to_dict(), 201

@academic_ns.route('/subjects')
class SubjectList(Resource):
    @jwt_required()
    def get(self):
        subjects = Subject.query.all()
        return [s.to_dict() for s in subjects], 200

    @jwt_required()
    def post(self):
        data = request.get_json() or {}
        sb = Subject(
            name=data.get('name'),
            code=data.get('code'),
            category=data.get('category', 'Islamic Studies'),
            credit_hours=data.get('credit_hours', 3)
        )
        db.session.add(sb)
        db.session.commit()
        return sb.to_dict(), 201
