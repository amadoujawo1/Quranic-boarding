from .user import User, Role, UserRole, ActivityLog
from .student import Student, Parent, MedicalRecord, StudentDocument, Alumni
from .admission import AdmissionApplication, AdmissionInquiry
from .quran import HifzProgress, TajweedEvaluation
from .academic import ClassGroup, Subject, Timetable, Homework, Exam, Grade
from .attendance import SchoolAttendance, HostelAttendance, PrayerAttendance, MealAttendance
from .boarding import Building, Dormitory, Room, Bed, HostelAllocation, VisitorLog, MaintenanceRequest
from .finance import FeeInvoice, FeePayment, Payroll, Donation, Expense, StudentPayment
from .inventory import InventoryItem, Book, BookBorrowing, Vehicle
from .health import ClinicVisit, Vaccination
from .communication import Announcement, Message, Notification

__all__ = [
    'User', 'Role', 'UserRole', 'ActivityLog',
    'Student', 'Parent', 'MedicalRecord', 'StudentDocument', 'Alumni',
    'AdmissionApplication', 'AdmissionInquiry',
    'HifzProgress', 'TajweedEvaluation',
    'ClassGroup', 'Subject', 'Timetable', 'Homework', 'Exam', 'Grade',
    'SchoolAttendance', 'HostelAttendance', 'PrayerAttendance', 'MealAttendance',
    'Building', 'Dormitory', 'Room', 'Bed', 'HostelAllocation', 'VisitorLog', 'MaintenanceRequest',
    'FeeInvoice', 'FeePayment', 'Payroll', 'Donation', 'Expense', 'StudentPayment',
    'InventoryItem', 'Book', 'BookBorrowing', 'Vehicle',
    'ClinicVisit', 'Vaccination',
    'Announcement', 'Message', 'Notification'
]

