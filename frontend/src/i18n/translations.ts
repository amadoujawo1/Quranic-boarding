export type Language = 'en' | 'ar';

export interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const translations: Translations = {
  // Brand
  school_name: {
    en: "Imaam Naafi' Centre for Quranic Memorization",
    ar: "مركز الإمام نافع لتحفيظ القرآن الكريم"
  },
  bismillah: {
    en: "In the Name of Allah, the Most Gracious, the Most Merciful",
    ar: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
  },
  location: {
    en: "Banjul, The Gambia",
    ar: "بانجول، غامبيا"
  },
  po_box: {
    en: "P.O. Box 220",
    ar: "ص.ب ٢٢٠"
  },
  tel: {
    en: "Tel: +220 87 7918643",
    ar: "هاتف: +220 87 7918643"
  },

  // Navigation Links
  nav_home: { en: "Home", ar: "الرئيسية" },
  nav_about: { en: "About Us", ar: "عن المركز" },
  nav_programmes: { en: "Programmes", ar: "البرامج التعليمية" },
  nav_hifz: { en: "Hifz Programme", ar: "برنامج التحفيظ" },
  nav_admissions: { en: "Admissions", ar: "القبول والتسجيل" },
  nav_contact: { en: "Contact", ar: "اتصل بنا" },
  nav_login: { en: "Portal Login", ar: "تسجيل الدخول" },
  nav_dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  nav_portal: { en: "Portal", ar: "البوابة" },

  // Admin Sidebar Menu
  menu_overview: { en: "Overview Dashboard", ar: "لوحة المتابعة العامة" },
  menu_attendance: { en: "Daily Attendance", ar: "سجل الحضور اليومي" },
  menu_admissions: { en: "Admissions", ar: "إدارة القبول" },
  menu_students: { en: "Student Management", ar: "إدارة الطلاب" },
  menu_users: { en: "Users & Roles", ar: "المستخدمون والصلاحيات" },
  menu_finance: { en: "Fee & Financials", ar: "الرسوم والمالية" },
  menu_parent_portal: { en: "Parent Portal", ar: "بوابة ولي الأمر" },
  menu_student_portal: { en: "Student Portal", ar: "بوابة الطالب" },
  menu_teacher_portal: { en: "Teacher Portal", ar: "بوابة المعلم" },

  // Buttons & Actions
  btn_sign_in: { en: "Sign In", ar: "تسجيل الدخول" },
  btn_signing_in: { en: "Signing in…", ar: "جاري الدخول…" },
  btn_sign_out: { en: "Sign Out", ar: "تسجيل الخروج" },
  btn_save: { en: "Save", ar: "حفظ" },
  btn_cancel: { en: "Cancel", ar: "إلغاء" },
  btn_edit: { en: "Edit", ar: "تعديل" },
  btn_delete: { en: "Delete", ar: "حذف" },
  btn_search: { en: "Search", ar: "بحث" },
  btn_filter: { en: "Filter", ar: "تصفية" },
  btn_print: { en: "Print", ar: "طباعة" },
  btn_print_receipt: { en: "Print Receipt", ar: "طباعة الإيصال" },
  btn_download: { en: "Download", ar: "تنزيل" },
  btn_export: { en: "Export", ar: "تصدير" },
  btn_view: { en: "View", ar: "عرض" },
  btn_add: { en: "Add New", ar: "إضافة جديد" },
  btn_add_student: { en: "Add Student", ar: "إضافة طالب" },
  btn_add_payment: { en: "Record Payment", ar: "تسجيل دفعة" },
  btn_mark_all_present: { en: "Mark All Present", ar: "تحديد الكل كحاضر" },
  btn_mark_all_jamaat: { en: "Mark All in Jamaat", ar: "تحديد الكل في جماعة" },
  btn_change_status: { en: "Change Status", ar: "تغيير الحالة" },
  btn_continue_school_account: { en: "Continue with School Account", ar: "المتابعة بحساب المركز" },
  btn_apply_admission: { en: "Apply for admission", ar: "تقديم طلب القبول" },
  btn_track_application: { en: "Track application", ar: "متابعة الطلب" },

  // Auth / Login
  login_title: { en: "Welcome back", ar: "مرحباً بكم من جديد" },
  login_subtitle: { en: "Sign in to continue to your portal.", ar: "سجل الدخول للمتابعة إلى بوابتك." },
  login_username_label: { en: "Username or Email", ar: "اسم المستخدم أو البريد الإلكتروني" },
  login_username_placeholder: { en: "Enter username...", ar: "أدخل اسم المستخدم..." },
  login_password_label: { en: "Password", ar: "كلمة المرور" },
  login_password_placeholder: { en: "Enter password...", ar: "أدخل كلمة المرور..." },
  login_2fa_title: { en: "Two-Factor Authentication", ar: "المصادقة الثنائية" },
  login_2fa_subtitle: { en: "Enter the 6-digit code from your authenticator app.", ar: "أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة." },
  login_new_here: { en: "NEW HERE?", ar: "جديد معنا؟" },
  login_tagline_1: { en: "Excellence in Quranic Memorization & Islamic Studies", ar: "التميز في حفظ القرآن الكريم والدراسات الإسلامية" },
  login_tagline_2: { en: "A distinguished boarding institution dedicated to nurturing the next generation of Huffadh with authentic Tajweed and righteous character.", ar: "مؤسسة قرآنية داخلية رائدة مكرسة لإعداد أجيال من حفظة كتاب الله تعالى بأحكام التجويد والأخلاق الفاضلة." },

  // Attendance & Prayers
  attendance_title: { en: "Daily School & Mosque Prayer Attendance", ar: "سجل الحضور اليومي والصلوات الخمس" },
  attendance_subtitle: { en: "Live roll-call tracking for academic sessions and five daily congregational prayers.", ar: "متابعة فورية لحضور الحلقات الدراسية وصلوات الجماعة الخمس." },
  tab_school_rollcall: { en: "Daily School Roll Call", ar: "حضور الحلقات الدراسية" },
  tab_prayer_jamaat: { en: "Mosque Prayer Jamaat", ar: "صلاة الجماعة بالمسجد" },
  school_attendance_rate: { en: "School Attendance", ar: "نسبة حضور الحلقات" },
  prayer_jamaat_rate: { en: "Jamaat Rate", ar: "نسبة صلاة الجماعة" },
  select_prayer: { en: "Select Waqt / Prayer:", ar: "اختر وقت الصلاة:" },
  save_attendance_log: { en: "Save Attendance Log", ar: "حفظ سجل الحضور" },
  saving: { en: "Saving...", ar: "جاري الحفظ..." },
  student_id: { en: "Student ID", ar: "رقم الطالب" },
  full_name: { en: "Full Name", ar: "الاسم الكامل" },
  gender: { en: "Gender", ar: "الجنس" },
  status: { en: "Attendance Status", ar: "حالة الحضور" },
  remarks: { en: "Remarks", ar: "ملاحظات" },
  quick_toggle: { en: "Quick Toggle", ar: "تبديل سريع" },

  // Attendance Statuses
  status_present: { en: "Present", ar: "حاضر" },
  status_late: { en: "Late", ar: "متأخر" },
  status_absent: { en: "Absent", ar: "غائب" },
  status_excused: { en: "Excused", ar: "معذور" },
  status_jamaat: { en: "Jamaat", ar: "جماعة" },

  // Prayers
  prayer_fajr: { en: "Fajr", ar: "الفجر" },
  prayer_dhuhr: { en: "Dhuhr", ar: "الظهر" },
  prayer_asr: { en: "Asr", ar: "العصر" },
  prayer_maghrib: { en: "Maghrib", ar: "المغرب" },
  prayer_isha: { en: "Isha", ar: "العشاء" },

  // Finance & Receipts
  finance_title: { en: "Fee & Financial Management", ar: "إدارة الرسوم والشؤون المالية" },
  official_fee_receipt: { en: "Official Student Fee Receipt", ar: "إيصال رسوم الطالب الرسمي" },
  receipt_no: { en: "Receipt No.", ar: "رقم الإيصال" },
  payment_date: { en: "Payment Date", ar: "تاريخ الدفع" },
  academic_year: { en: "Academic Year", ar: "العام الدراسي" },
  payment_month: { en: "Payment Month", ar: "شهر الدفع" },
  payment_method: { en: "Payment Method", ar: "طريقة الدفع" },
  class_level: { en: "Class / Level", ar: "المستوى الدراسي" },
  amount_due: { en: "Amount Due", ar: "المبلغ المستحق" },
  amount_paid: { en: "Amount Paid", ar: "المبلغ المدفوع" },
  balance: { en: "Balance", ar: "المتبقي" },
  total: { en: "Total", ar: "المجموع" },
  fee_description: { en: "Fee Description", ar: "بيان الرسوم" },

  // Pagination & Common
  showing: { en: "Showing", ar: "عرض" },
  to: { en: "to", ar: "إلى" },
  of: { en: "of", ar: "من أصل" },
  entries: { en: "entries", ar: "سجلات" },
  previous: { en: "Previous", ar: "السابق" },
  next: { en: "Next", ar: "التالي" },
  no_records: { en: "No records found", ar: "لا توجد سجلات" },
  all_caught_up: { en: "All caught up!", ar: "تم الاطلاع على كل الإشعارات!" },
  notifications: { en: "Notifications", ar: "الإشعارات" },
  mark_all_read: { en: "Mark all as read", ar: "تحديد الكل كمقروء" },

  // Languages
  lang_english: { en: "English", ar: "الإنجليزية" },
  lang_arabic: { en: "العربية", ar: "العربية" }
};
