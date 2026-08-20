from datetime import datetime, date
from app import create_app, db
from app.models.user import User, Role
from app.models.student import Student, Parent, MedicalRecord, Alumni
from app.models.academic import ClassGroup, Subject
from app.models.boarding import Building, Dormitory, Room, Bed
from app.models.quran import HifzProgress
from app.models.finance import FeeInvoice, Donation, StudentPayment

def seed_database(app_instance=None):
    def _do_seed():
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
        student = Student.query.filter_by(student_id_number='QBS-2026-001').first()
        if not student:
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

        # Seed Hifz Huffaz Graduates (Alumni)
        if Alumni.query.count() == 0:
            graduates_data = [
                {"name": "Tariq Mahmood", "year": 2025, "date": date(2025, 5, 20), "occ": "Engineering Student", "edu": "University of The Gambia", "gender": "Male"},
                {"name": "Maryam Al-Maktoum", "year": 2025, "date": date(2025, 4, 12), "occ": "Medical Student", "edu": "King Saud University", "gender": "Female"},
                {"name": "Omar Al-Ghamdi", "year": 2024, "date": date(2024, 6, 15), "occ": "Qira'at Instructor & Imam", "edu": "Madinah Islamic University", "gender": "Male"},
                {"name": "Fatimah Jallow", "year": 2024, "date": date(2024, 5, 10), "occ": "Islamic Law Scholar", "edu": "Al-Azhar University, Cairo", "gender": "Female"},
                {"name": "Bilal Gassama", "year": 2024, "date": date(2024, 3, 22), "occ": "Software Engineer & Hafiz", "edu": "BSc Computer Science", "gender": "Male"},
                {"name": "Aisha Ceesay", "year": 2023, "date": date(2023, 7, 1), "occ": "Secondary Quran Teacher", "edu": "Islamic Institute of Senegal", "gender": "Female"},
                {"name": "Mustapha Camara", "year": 2023, "date": date(2023, 4, 18), "occ": "Business Administrator", "edu": "BBA International Business", "gender": "Male"},
                {"name": "Zainab Bah", "year": 2023, "date": date(2023, 3, 30), "occ": "Tajweed Specialist & Reciter", "edu": "Imaam Naafi Centre", "gender": "Female"},
                {"name": "Hamza Sallah", "year": 2022, "date": date(2022, 8, 14), "occ": "Shariah Law Graduate", "edu": "Al-Azhar University", "gender": "Male"},
                {"name": "Khadija Toure", "year": 2022, "date": date(2022, 5, 25), "occ": "Public Health Specialist", "edu": "MSc Public Health", "gender": "Female"},
                {"name": "Ousman Diallo", "year": 2022, "date": date(2022, 2, 11), "occ": "Resident Imam & Khateeb", "edu": "Higher Institute of Islamic Studies", "gender": "Male"},
                {"name": "Aminata Sow", "year": 2021, "date": date(2021, 6, 30), "occ": "Computer Science Graduate", "edu": "BSc Information Tech", "gender": "Female"},
                {"name": "Suleyman Joof", "year": 2021, "date": date(2021, 4, 5), "occ": "Arabic Literature Scholar", "edu": "Riyadh Islamic University", "gender": "Male"},
                {"name": "Ruqayyaha Njie", "year": 2020, "date": date(2020, 7, 20), "occ": "Islamic Finance Officer", "edu": "BSc Banking & Finance", "gender": "Female"},
                {"name": "Ibrahim Touray", "year": 2020, "date": date(2020, 3, 15), "occ": "Hifz Academy Director", "edu": "MA Educational Leadership", "gender": "Male"}
            ]

            student_role = Role.query.filter_by(name='Student').first()

            for idx, g in enumerate(graduates_data, 1):
                clean_name = g['name'].lower().replace(' ', '_').replace("'", "")
                username = f"grad_{clean_name}"
                email = f"{username}@qbsms.edu"

                if not User.query.filter_by(username=username).first():
                    u = User(
                        username=username,
                        email=email,
                        full_name=g['name'],
                        phone=f"+22070{idx:05d}"
                    )
                    u.set_password("HafizPass123!")
                    if student_role:
                        u.roles.append(student_role)
                    db.session.add(u)
                    db.session.flush()

                    s = Student(
                        user_id=u.id,
                        student_id_number=f"QBS-HAF-{g['year']}-{idx:03d}",
                        date_of_birth=date(g['year'] - 16, 1, 1),
                        gender=g['gender'],
                        status='Graduated'
                    )
                    db.session.add(s)
                    db.session.flush()

                    alm = Alumni(
                        student_id=s.id,
                        graduation_year=g['year'],
                        hifz_completion_date=g['date'],
                        current_occupation=g['occ'],
                        higher_education=g['edu'],
                        contact_email=email
                    )
                    db.session.add(alm)

        # Seed Demo Student: Abdul Rahman Jallow (INCM-2026-001)
        abdul = Student.query.filter_by(student_id_number='INCM-2026-001').first()
        if not abdul:
            abdul_user = User.query.filter_by(username='std_abdul_rahman').first()
            if not abdul_user:
                abdul_user = User(
                    username='std_abdul_rahman',
                    email='abdul.jallow@qbsms.edu',
                    full_name='Abdul Rahman Jallow',
                    phone='+2203011223'
                )
                abdul_user.set_password('StudentPass123!')
                if 'Student' in roles_dict:
                    abdul_user.roles.append(roles_dict['Student'])
                db.session.add(abdul_user)
                db.session.flush()

            abdul_parent_user = User.query.filter_by(username='parent_ebrima').first()
            if not abdul_parent_user:
                abdul_parent_user = User(
                    username='parent_ebrima',
                    email='ebrima.jallow@qbsms.edu',
                    full_name='Ebrima Jallow',
                    phone='+2207788990'
                )
                abdul_parent_user.set_password('ParentPass123!')
                if 'Parent' in roles_dict:
                    abdul_parent_user.roles.append(roles_dict['Parent'])
                db.session.add(abdul_parent_user)
                db.session.flush()

                abdul_parent = Parent(user_id=abdul_parent_user.id, relationship='Father', occupation='Accountant', address='Banjul / Brusubi')
                db.session.add(abdul_parent)
                db.session.flush()
            else:
                abdul_parent = Parent.query.filter_by(user_id=abdul_parent_user.id).first()

            abdul = Student(
                user_id=abdul_user.id,
                student_id_number='INCM-2026-001',
                date_of_birth=date(2013, 8, 14),
                gender='Male',
                blood_group='A+',
                parent_id=abdul_parent.id if abdul_parent else None,
                status='Active'
            )
            db.session.add(abdul)
            db.session.flush()

        # Seed Monthly Payments for Abdul Rahman Jallow (as specified in prompt)
        if abdul and StudentPayment.query.filter_by(student_id=abdul.id).count() == 0:
            payments_data = [
                {
                    'month': 'August 2026', 'fee_type': 'Boarding / Tuition / Meals',
                    'due': 2500.0, 'paid': 2500.0, 'date': date(2026, 8, 19),
                    'method': 'Cash', 'receipt': 'REC-000123', 'status': 'Paid', 'remarks': 'Fully paid for August semester commencement'
                },
                {
                    'month': 'September 2026', 'fee_type': 'Boarding / Tuition / Meals',
                    'due': 2500.0, 'paid': 2500.0, 'date': date(2026, 9, 5),
                    'method': 'Bank Transfer', 'receipt': 'REC-000124', 'status': 'Paid', 'remarks': 'Transferred via Trust Bank'
                },
                {
                    'month': 'October 2026', 'fee_type': 'Boarding / Tuition / Meals',
                    'due': 2500.0, 'paid': 2000.0, 'date': date(2026, 10, 10),
                    'method': 'Wave / Mobile Money', 'receipt': 'REC-000125', 'status': 'Partial', 'remarks': 'GMD 500 balance remaining'
                },
                {
                    'month': 'November 2026', 'fee_type': 'Boarding / Tuition / Meals',
                    'due': 2500.0, 'paid': 0.0, 'date': date(2026, 11, 1),
                    'method': 'Cash', 'receipt': 'REC-000126', 'status': 'Unpaid', 'remarks': 'Pending monthly payment reminder sent to parent'
                },
                {
                    'month': 'December 2026', 'fee_type': 'Boarding / Tuition / Meals',
                    'due': 2500.0, 'paid': 2500.0, 'date': date(2026, 12, 15),
                    'method': 'QMoney', 'receipt': 'REC-000127', 'status': 'Paid', 'remarks': 'End of term full payment'
                }
            ]

            for p in payments_data:
                sp = StudentPayment(
                    student_id=abdul.id,
                    academic_year='2026/2027',
                    payment_month=p['month'],
                    class_level='Hifz Level 2',
                    fee_type=p['fee_type'],
                    amount_due=p['due'],
                    amount_paid=p['paid'],
                    payment_date=p['date'],
                    payment_method=p['method'],
                    receipt_number=p['receipt'],
                    status=p['status'],
                    remarks=p['remarks'],
                    recorded_by='Super Administrator'
                )
                sp.compute_status()
                db.session.add(sp)

        # Seed additional active student with payments: Fatimah Ceesay (INCM-2026-002)
        fatimah = Student.query.filter_by(student_id_number='INCM-2026-002').first()
        if not fatimah:
            fatimah_user = User.query.filter_by(username='std_fatimah_ceesay').first()
            if not fatimah_user:
                fatimah_user = User(
                    username='std_fatimah_ceesay',
                    email='fatimah.ceesay@qbsms.edu',
                    full_name='Fatimah Ceesay',
                    phone='+2203344556'
                )
                fatimah_user.set_password('StudentPass123!')
                if 'Student' in roles_dict:
                    fatimah_user.roles.append(roles_dict['Student'])
                db.session.add(fatimah_user)
                db.session.flush()

            fatimah = Student(
                user_id=fatimah_user.id,
                student_id_number='INCM-2026-002',
                date_of_birth=date(2014, 3, 20),
                gender='Female',
                blood_group='B+',
                status='Active'
            )
            db.session.add(fatimah)
            db.session.flush()

            if StudentPayment.query.filter_by(student_id=fatimah.id).count() == 0:
                sp1 = StudentPayment(
                    student_id=fatimah.id,
                    academic_year='2026/2027',
                    payment_month='August 2026',
                    class_level='Tajweed Foundation',
                    fee_type='Tuition',
                    amount_due=2500.0,
                    amount_paid=2500.0,
                    payment_date=date(2026, 8, 18),
                    payment_method='Wave / Mobile Money',
                    receipt_number='REC-000128',
                    remarks='Paid in full via Wave',
                    recorded_by='Super Administrator'
                )
                sp1.compute_status()
                db.session.add(sp1)

        db.session.commit()
        print("Database successfully seeded with demo QBSMS data, student payments, and 15 Hifz Huffaz Graduates!")

    if app_instance:
        with app_instance.app_context():
            _do_seed()
    else:
        _do_seed()

if __name__ == '__main__':
    app = create_app()
    seed_database(app)


