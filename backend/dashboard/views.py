from collections import defaultdict
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import CustomUser
from accounts.permissions import IsAdmin
from assignments.models import Assignment, Submission
from attendance.models import Attendance
from batches.models import Batch
from developers.models import Developer
from schedules.models import Session
from schedules.serializers import SessionSerializer

User = get_user_model()


def _date_range_last_days(days: int):
    today = timezone.localdate()
    start = today - timedelta(days=days)
    return start, today


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_dashboard(request):
    start_30, today = _date_range_last_days(30)

    total_batches = Batch.objects.count()
    active_batches = Batch.objects.filter(status=Batch.Status.ACTIVE).count()
    total_developers = Developer.objects.count()
    active_developers = Developer.objects.filter(is_active=True).count()

    attendance_qs = Attendance.objects.filter(
        session__session_date__gte=start_30,
        session__session_date__lte=today,
    )
    total_marks = attendance_qs.count()
    present_marks = attendance_qs.filter(status=Attendance.Status.PRESENT).count()
    overall_attendance_rate = (
        round(100.0 * present_marks / total_marks, 1) if total_marks else 0.0
    )

    submission_count = Submission.objects.count()
    expected_slots = 0
    for a in Assignment.objects.all():
        dev_count = Developer.objects.filter(batch=a.batch).count()
        expected_slots += dev_count
    assignments_submitted_rate = (
        round(100.0 * submission_count / expected_slots, 1) if expected_slots else 0.0
    )

    trend_map: dict[str, dict[str, int]] = defaultdict(
        lambda: {"present": 0, "absent": 0}
    )
    for row in attendance_qs.values("session__session_date", "status"):
        d = row["session__session_date"].isoformat() if row["session__session_date"] else None
        if not d:
            continue
        st = row["status"]
        if st == Attendance.Status.PRESENT:
            trend_map[d]["present"] += 1
        elif st == Attendance.Status.ABSENT:
            trend_map[d]["absent"] += 1

    attendance_trend = sorted(
        [{"date": k, **v} for k, v in trend_map.items()],
        key=lambda x: x["date"],
    )

    batch_performance = []
    for batch in Batch.objects.all():
        b_att = Attendance.objects.filter(session__batch=batch)
        b_total = b_att.count()
        b_present = b_att.filter(status=Attendance.Status.PRESENT).count()
        attendance_rate = round(100.0 * b_present / b_total, 1) if b_total else 0.0

        dev_c = Developer.objects.filter(batch=batch).count()
        sub_c = Submission.objects.filter(assignment__batch=batch).count()
        assign_c = Assignment.objects.filter(batch=batch).count()
        expected = max(1, assign_c * dev_c)
        submission_rate = round(100.0 * sub_c / expected, 1)

        batch_performance.append(
            {
                "batch_name": batch.batch_name,
                "attendance_rate": attendance_rate,
                "submission_rate": submission_rate,
            }
        )

    recent_sessions = SessionSerializer(
        Session.objects.select_related("batch")
        .order_by("-session_date", "-id")[:15],
        many=True,
    ).data

    top_developers = []
    for dev in Developer.objects.select_related("batch", "user")[:50]:
        att = Attendance.objects.filter(developer=dev)
        t = att.count()
        pr = att.filter(status=Attendance.Status.PRESENT).count()
        pct = round(100.0 * pr / t, 1) if t else 0.0
        subs = Submission.objects.filter(developer=dev).count()
        top_developers.append(
            {
                "name": dev.full_name,
                "attendance_pct": pct,
                "submissions": subs,
            }
        )
    top_developers.sort(key=lambda x: (-x["attendance_pct"], -x["submissions"]))
    top_developers = top_developers[:10]

    return Response(
        {
            "total_batches": total_batches,
            "active_batches": active_batches,
            "total_developers": total_developers,
            "active_developers": active_developers,
            "overall_attendance_rate": overall_attendance_rate,
            "assignments_submitted_rate": assignments_submitted_rate,
            "attendance_trend": attendance_trend,
            "batch_performance": batch_performance,
            "recent_sessions": recent_sessions,
            "top_developers": top_developers,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def developer_dashboard(request):
    if getattr(request.user, "role", None) != CustomUser.Role.DEVELOPER:
        return Response({"detail": "Developer access only."}, status=403)
    try:
        dev = request.user.developer_profile
    except Developer.DoesNotExist:
        return Response({"detail": "No developer profile."}, status=400)

    batch = dev.batch
    my_batch = None
    progress_percentage = 0.0
    if batch:
        total_sess = Session.objects.filter(batch=batch).count()
        done_sess = Session.objects.filter(batch=batch, is_completed=True).count()
        if total_sess:
            progress_percentage = round(100.0 * done_sess / total_sess, 1)
        mentor_name = ""
        if batch.mentor_id:
            m = batch.mentor
            mentor_name = m.get_full_name() or m.email
        my_batch = {
            "name": batch.batch_name,
            "mentor": mentor_name,
            "progress_percentage": progress_percentage,
            "start_date": batch.start_date,
            "end_date": batch.end_date,
        }

    att_all = Attendance.objects.filter(developer=dev)
    total_marked = att_all.count()
    present = att_all.filter(status=Attendance.Status.PRESENT).count()
    absent = att_all.filter(status=Attendance.Status.ABSENT).count()
    leave = att_all.filter(status=Attendance.Status.LEAVE).count()
    attendance_percentage = (
        round(100.0 * present / total_marked, 1) if total_marked else 0.0
    )

    start_30, today = _date_range_last_days(30)
    trend_rows = att_all.filter(
        session__session_date__gte=start_30,
        session__session_date__lte=today,
    ).select_related("session")
    attendance_trend = []
    for row in trend_rows.order_by("session__session_date"):
        attendance_trend.append(
            {
                "date": row.session.session_date.isoformat(),
                "status": row.status,
            }
        )

    upcoming_qs = Session.objects.none()
    if batch:
        upcoming_qs = (
            Session.objects.filter(batch=batch, session_date__gte=today)
            .order_by("session_date")[:5]
        )
    upcoming_sessions = SessionSerializer(upcoming_qs, many=True).data

    pending_assignments = []
    submitted_assignments = []
    if batch:
        for ass in Assignment.objects.filter(batch=batch).order_by("due_date"):
            sub = Submission.objects.filter(assignment=ass, developer=dev).first()
            ass_data = {
                "id": ass.id,
                "title": ass.title,
                "description": ass.description,
                "due_date": ass.due_date,
            }
            if sub:
                submitted_assignments.append({**ass_data, "submitted_at": sub.submitted_at})
            else:
                pending_assignments.append(ass_data)

    recent_attendance = []
    for rec in att_all.select_related("session").order_by("-marked_at")[:10]:
        recent_attendance.append(
            {
                "session_date": rec.session.session_date.isoformat(),
                "session_title": rec.session.title,
                "status": rec.status,
            }
        )

    days_remaining = None
    if batch and batch.end_date >= today:
        days_remaining = (batch.end_date - today).days

    return Response(
        {
            "my_batch": my_batch,
            "attendance_percentage": attendance_percentage,
            "total_present": present,
            "total_absent": absent,
            "total_leave": leave,
            "attendance_trend": attendance_trend,
            "upcoming_sessions": upcoming_sessions,
            "pending_assignments": pending_assignments,
            "submitted_assignments": submitted_assignments,
            "recent_attendance": recent_attendance,
            "days_remaining": days_remaining,
        }
    )
