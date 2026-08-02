from datetime import datetime, date
from app import create_app, db
from app.models.user import User, Role
from app.models.student import Student, Parent, MedicalRecord
from app.models.academic import ClassGroup, Subject
from app.models.boarding import Building, Dormitory, Room, Bed
from app.models.quran import HifzProgress
from app.models.finance import FeeInvoice, Donation

app = create_app()

def seed_database():
    with app.app_context():
        db.create_all()

        # Roles list
        role_names = [
            'Super Administrator', 'Principal', 'Vice Principal', 'Academic Coordinator',
            'Hifz Coordinator', 'Quran Teacher', 'Academic Teacher', 'Hostel Master',
            'Hostel Matron', 'Accountant', 'Librarian', 'Admissions Officer',
            'Kitchen Manager', 'Security Officer', 'Parent', 'Student'
        ]

        roles_dict = {}
        for rname in role_names:
            role = Role.query.filter_by(name=rname).first()
            if not role:
                role = Role(name=rname, description=f'{rname} role access')
                db.session.add(role)
            roles_dict[rname] = role
        db.session.commit()

        # Super Admin User
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@qbsms.edu',
                full_name='Sheikh Suwaibou Bah',
                phone='+1234567890'
            )
            admin.set_password('AdminPass123!')
            admin.roles.append(roles_dict['Super Administrator'])
            db.session.add(admin)

        # Demo Hifz Teacher
        teacher = User.query.filter_by(username='teacher1').first()
        if not teacher:
            teacher = User(
                username='teacher1',
                email='quran.teacher@qbsms.edu',
                full_name='Ustadh Bilal Ibn Rabah',
                phone='+1987654321'
            )
            teacher.set_password('TeacherPass123!')
            teacher.roles.append(roles_dict['Quran Teacher'])
            db.session.add(teacher)

        # Demo Parent
        parent_user = User.query.filter_by(username='parent1').first()
        if not parent_user:
            parent_user = User(
                username='parent1',
                email='parent@qbsms.edu',
                full_name='Ibrahim Al-Faruq',
                phone='+1555444333'
            )
            parent_user.set_password('ParentPass123!')
            parent_user.roles.append(roles_dict['Parent'])
            db.session.add(parent_user)
            db.session.flush()

            parent_profile = Parent(user_id=parent_user.id, relationship='Father', occupation='Engineer', address='123 Hijrah Way')
            db.session.add(parent_profile)

        # Demo Student
        student_user = User.query.filter_by(username='std2026001').first()
        if not student_user:
            student_user = User(
                username='std2026001',
                email='student1@qbsms.edu',
                full_name='Youssef Al-Faruq',
                phone='+1555111222'
            )
            student_user.set_password('StudentPass123!')
            student_user.roles.append(roles_dict['Student'])
            db.session.add(student_user)
            db.session.flush()

            student = Student(
                user_id=student_user.id,
                student_id_number='QBS-2026-001',
                date_of_birth=date(2012, 5, 15),
                gender='Male',
                blood_group='O+',
                parent_id=parent_profile.id if parent_profile else None,
                status='Active'
            )
            db.session.add(student)
            db.session.flush()

            # Seed Hifz Record
            hifz = HifzProgress(
                student_id=student.id,
                teacher_id=teacher.id if teacher else None,
                date=date.today(),
                sabaq_surah='Al-Baqarah',
                sabaq_juz=2,
                sabaq_start_page=25,
                sabaq_end_page=27,
                sabaq_grade='A+',
                sabqi_juz=1,
                sabqi_pages='15-24',
                sabqi_grade='A',
                manzil_juz=1,
                manzil_pages='1-14',
                manzil_grade='A+',
                teacher_notes='Excellent Makharij and Tajweed precision.'
            )
            db.session.add(hifz)

            # Seed Invoice
            inv = FeeInvoice(
                invoice_number='INV-2026-001',
                student_id=student.id,
                academic_term='Term 1',
                academic_year='2026/2027',
                tuition_fee=1200.0,
                boarding_fee=0.0,
                feeding_fee=0.0,
                total_amount=1200.0,
                amount_paid=1500.0,
                status='Partial',
                due_date=date(2026, 9, 1)
            )
            db.session.add(inv)

        db.session.commit()
        print("Database successfully seeded with demo QBSMS data!")

if __name__ == '__main__':
    seed_database()
