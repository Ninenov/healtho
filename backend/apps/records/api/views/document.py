from pathlib import Path

from django.http import FileResponse
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.records.models import MedicalRecord
from apps.patients.selectors.patient import get_patient_by_user


class MedicalRecordDocumentDownloadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        patient = get_patient_by_user(request.user)

        if patient is None:
            raise NotFound("Patient profile not found.")

        record = MedicalRecord.objects.filter(
            patient=patient,
            pk=pk,
        ).first()

        if record is None:
            raise NotFound("Medical record not found.")

        if not record.document:
            raise NotFound("No document is attached to this record.")

        try:
            file_handle = record.document.open("rb")
        except (FileNotFoundError, OSError, ValueError):
            raise NotFound("The stored document is unavailable.")

        filename = Path(
            record.original_filename or "medical-document"
        ).name

        response = FileResponse(
            file_handle,
            as_attachment=True,
            filename=filename,
            content_type="application/octet-stream",
        )
        response["X-Content-Type-Options"] = "nosniff"
        response["Cache-Control"] = "private, no-store"
        return response
