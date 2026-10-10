from .record import (
    MedicalRecordListCreateAPIView,
    MedicalRecordDetailAPIView,
)

from .document import (
    MedicalRecordDocumentDownloadAPIView,
)

__all__ = [
    "MedicalRecordListCreateAPIView",
    "MedicalRecordDetailAPIView",
]