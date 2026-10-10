import os

from django.core.exceptions import ValidationError
from django.http import FileResponse
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.appointments.models import Appointment
from apps.clinical.api.serializers import ClinicalAttachmentSerializer
from apps.clinical.models.models import ClinicalAttachment, ClinicalEncounter


MAX_FILE_BYTES = 10 * 1024 * 1024

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_CONTENT_TYPES = {
    ".pdf": {"application/pdf"},
    ".jpg": {"image/jpeg"},
    ".jpeg": {"image/jpeg"},
    ".png": {"image/png"},
}


def get_authorized_encounter(request, encounter_id):
    try:
        encounter = ClinicalEncounter.objects.select_related(
            "appointment",
            "doctor",
            "patient",
        ).get(id=encounter_id)
    except ClinicalEncounter.DoesNotExist:
        return None

    if encounter.doctor.user_id != request.user.id:
        return None

    return encounter


class ClinicalAttachmentListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, encounter_id):
        encounter = get_authorized_encounter(request, encounter_id)

        if encounter is None:
            return Response(
                {"detail": "Clinical encounter not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        attachments = encounter.attachments.select_related("uploaded_by").all()

        return Response(
            ClinicalAttachmentSerializer(attachments, many=True).data,
            status=status.HTTP_200_OK,
        )

    def post(self, request, encounter_id):
        encounter = get_authorized_encounter(request, encounter_id)

        if encounter is None:
            return Response(
                {"detail": "Clinical encounter not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if encounter.appointment.status != Appointment.Status.IN_PROGRESS:
            return Response(
                {"detail": "Files can only be uploaded during an active consultation."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        uploaded_file = request.FILES.get("file")
        title = str(request.data.get("title", "")).strip()
        description = str(request.data.get("description", "")).strip()
        category = request.data.get("category", "OTHER")

        if uploaded_file is None:
            return Response(
                {"file": ["A file is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not title or len(title) > 150:
            return Response(
                {"title": ["Enter a title of 1–150 characters."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if uploaded_file.size > MAX_FILE_BYTES:
            return Response(
                {"file": ["File must be 10 MB or smaller."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        extension = os.path.splitext(uploaded_file.name)[1].lower()

        if extension not in ALLOWED_EXTENSIONS:
            return Response(
                {"file": ["Only PDF, JPG, JPEG, and PNG files are supported."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if uploaded_file.content_type not in ALLOWED_CONTENT_TYPES[extension]:
            return Response(
                {"file": ["The file content type does not match its extension."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid_categories = {
            choice[0] for choice in ClinicalAttachment.Category.choices
        }

        if category not in valid_categories:
            return Response(
                {"category": ["Invalid category."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        attachment = ClinicalAttachment(
            encounter=encounter,
            title=title,
            description=description,
            category=category,
            file=uploaded_file,
            original_filename=os.path.basename(uploaded_file.name)[:255],
            content_type=uploaded_file.content_type,
            size_bytes=uploaded_file.size,
            uploaded_by=request.user,
        )

        try:
            attachment.full_clean(exclude=["file"])
            attachment.save()
        except ValidationError as exc:
            if hasattr(exc, "message_dict"):
                return Response(
                    exc.message_dict,
                    status=status.HTTP_400_BAD_REQUEST,
                )

            return Response(
                {"detail": exc.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            ClinicalAttachmentSerializer(attachment).data,
            status=status.HTTP_201_CREATED,
        )


class ClinicalAttachmentDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, attachment_id):
        try:
            attachment = ClinicalAttachment.objects.select_related(
                "encounter__doctor",
            ).get(id=attachment_id)
        except ClinicalAttachment.DoesNotExist:
            return Response(
                {"detail": "Clinical attachment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if attachment.encounter.doctor.user_id != request.user.id:
            return Response(
                {"detail": "Clinical attachment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            file_handle = attachment.file.open("rb")
        except (OSError, ValueError):
            return Response(
                {"detail": "The stored file is unavailable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        response = FileResponse(
            file_handle,
            as_attachment=True,
            filename=attachment.original_filename,
            content_type=attachment.content_type,
        )
        response["X-Content-Type-Options"] = "nosniff"
        response["Cache-Control"] = "private, no-store"
        return response