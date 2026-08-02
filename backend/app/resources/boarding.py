from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required
from .. import db
from ..models.boarding import Building, Dormitory, Room, Bed, VisitorLog, MaintenanceRequest

boarding_ns = Namespace('boarding', description='Hostel and Dormitory Management')

@boarding_ns.route('/buildings')
class BuildingList(Resource):
    @jwt_required()
    def get(self):
        buildings = Building.query.all()
        return [{
            'id': b.id,
            'name': b.name,
            'gender': b.gender,
            'total_capacity': b.total_capacity
        } for b in buildings], 200

    @jwt_required()
    def post(self):
        data = request.get_json() or {}
        b = Building(name=data.get('name'), gender=data.get('gender', 'Boys'), total_capacity=data.get('total_capacity', 100))
        db.session.add(b)
        db.session.commit()
        return {'id': b.id, 'name': b.name}, 201
