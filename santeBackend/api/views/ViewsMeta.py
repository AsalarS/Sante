from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from ..models import CarePlan, Diagnosis, Employee, Prescription, Patient, Appointment
from ..serializers import CarePlanExtraDataSerializer, CarePlanSerializer, DiagnosisExtraDataSerializer, DiagnosisSerializer, PrescriptionSerializer
from rest_framework.response import Response
from ..utilities import log_to_db
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone


class PrescriptionsByUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to view these prescriptions."}, status=status.HTTP_403_FORBIDDEN)

        patient = get_object_or_404(Patient, user__id=user_id)

        prescriptions = Prescription.objects.filter(
            appointment__patient=patient)
        serializer = PrescriptionSerializer(prescriptions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, user_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to update these prescriptions."}, status=status.HTTP_403_FORBIDDEN)

        patient = get_object_or_404(Patient, user__id=user_id)
        prescriptions = Prescription.objects.filter(
            appointment__patient=patient)
        data = request.data

        for prescription in prescriptions:
            serializer = PrescriptionSerializer(
                prescription, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                log_to_db(request, "UPDATE: Prescription",
                          f"Prescription {prescription.id} updated for patient {patient.user.email}")
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Prescriptions updated successfully"}, status=status.HTTP_200_OK)

    def delete(self, request, user_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to delete these prescriptions."}, status=status.HTTP_403_FORBIDDEN)

        patient = get_object_or_404(Patient, user__id=user_id)
        prescriptions = Prescription.objects.filter(
            appointment__patient=patient)

        for prescription in prescriptions:
            log_to_db(request, "DELETE: Prescription",
                      f"Prescription {prescription.id} deleted for patient {patient.user.email}")
            prescription.delete()

        return Response({"message": "Prescriptions deleted successfully"}, status=status.HTTP_200_OK)


class PrescriptionByAppointmentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, appointment_id):
        user = request.user
        
        appointment = get_object_or_404(Appointment, id=appointment_id)
        
        # Check if user is the patient assigned to this appointment
        is_patient = hasattr(user, 'patient') and user.patient == appointment.patient
        
        # Check if user has staff role or is the patient
        if not (user.role in ['admin', 'nurse', 'doctor'] or is_patient):
            return Response(
                {"error": "You do not have permission to view these prescriptions."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        prescriptions = Prescription.objects.filter(appointment=appointment)
        serializer = PrescriptionSerializer(prescriptions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, appointment_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to update these prescriptions."}, status=status.HTTP_403_FORBIDDEN)

        appointment = get_object_or_404(Appointment, id=appointment_id)
        prescriptions = Prescription.objects.filter(appointment=appointment)
        data = request.data

        for prescription in prescriptions:
            serializer = PrescriptionSerializer(
                prescription, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                log_to_db(request, "UPDATE: Prescription",
                          f"Prescription {prescription.id} updated for appointment {appointment.id}")
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Prescriptions updated successfully"}, status=status.HTTP_200_OK)

    def delete(self, request, appointment_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to delete these prescriptions."}, status=status.HTTP_403_FORBIDDEN)

        appointment = get_object_or_404(Appointment, id=appointment_id)
        prescriptions = Prescription.objects.filter(appointment=appointment)

        for prescription in prescriptions:
            log_to_db(request, "DELETE: Prescription",
                      f"Prescription {prescription.id} deleted for appointment {appointment.id}")
            prescription.delete()

        return Response({"message": "Prescriptions deleted successfully"}, status=status.HTTP_200_OK)

# Diagnoses Views


class DiagnosesByUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['receptionist', 'admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to view these diagnoses."}, status=status.HTTP_403_FORBIDDEN)

        try:
            patient = Patient.objects.get(user__id=user_id)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)

        diagnoses = Diagnosis.objects.filter(appointment__patient=patient)
        serializer = DiagnosisExtraDataSerializer(diagnoses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DiagnosisByAppointmentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, appointment_id):
        user = request.user
        
        appointment = get_object_or_404(Appointment, id=appointment_id)
        
        # Check if user is the patient assigned to this appointment
        is_patient = hasattr(user, 'patient') and user.patient == appointment.patient
        
        # Check if user has staff role or is the patient
        if not (user.role in ['receptionist', 'admin', 'nurse', 'doctor'] or is_patient):
            return Response(
                {"error": "You do not have permission to view these diagnoses."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        diagnoses = Diagnosis.objects.filter(appointment=appointment)
        serializer = DiagnosisSerializer(diagnoses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, appointment_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['receptionist', 'admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to create or update diagnoses."}, status=status.HTTP_403_FORBIDDEN)

        appointment = get_object_or_404(Appointment, id=appointment_id)

        # Check if the appointment status is "Scheduled"
        if appointment.status != "Scheduled":
            return Response({"error": "Only scheduled appointments can be edited."}, status=status.HTTP_400_BAD_REQUEST)

        # Get the diagnosis ID from the request data (if exists)
        diagnosis_id = request.data.get('id', None)

        if diagnosis_id:
            # If diagnosis_id exists, try to find the existing diagnosis
            try:
                diagnosis = Diagnosis.objects.get(
                    id=diagnosis_id, appointment=appointment)
            except Diagnosis.DoesNotExist:
                return Response({"error": "Diagnosis not found for this appointment."}, status=status.HTTP_404_NOT_FOUND)

            # Update the diagnosis
            serializer = DiagnosisSerializer(
                diagnosis, data=request.data, partial=True)
        else:
            # If no diagnosis_id exists, create a new diagnosis
            # Ensure the diagnosis is linked to the appointment
            request.data['appointment'] = appointment.id
            log_to_db(
                request,
                "CREATE: Diagnosis",
                f"Appointment ID: {appointment.id}, "
                f"Name: {request.data.get('diagnosis_name', '')}, "
                f"Type: {request.data.get('diagnosis_type', '')}, "
            )
            serializer = DiagnosisSerializer(data=request.data)

        # Validate and save the diagnosis
        if serializer.is_valid():
            diagnosis = serializer.save()
            return Response(DiagnosisSerializer(diagnosis).data, status=status.HTTP_200_OK if diagnosis_id else status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, appointment_id, diagnosis_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['receptionist', 'admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to delete diagnoses."}, status=status.HTTP_403_FORBIDDEN)

        appointment = get_object_or_404(Appointment, id=appointment_id)

        # Check if the appointment status is "Scheduled"
        if appointment.status != "Scheduled":
            return Response({"error": "Only scheduled appointments can be edited."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            diagnosis = Diagnosis.objects.get(
                id=diagnosis_id, appointment=appointment)
        except Diagnosis.DoesNotExist:
            return Response({"error": "Diagnosis not found for this appointment."}, status=status.HTTP_404_NOT_FOUND)

        # Log the deletion (optional, for audit purposes)
        log_to_db(request, "DELETE: Diagnosis",
                  f"Diagnosis ID: {diagnosis.id}, Diagnosis Name: {diagnosis.diagnosis_name}, Diagnosis Type: {diagnosis.diagnosis_type} Appointment ID: {appointment.id}")

        # Delete the diagnosis
        diagnosis.delete()
        return Response({"message": "Diagnosis deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

# Care Plan Views


class CarePlansByUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['receptionist', 'admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to view these care plans."}, status=status.HTTP_403_FORBIDDEN)

        patient = get_object_or_404(Patient, user__id=user_id)

        care_plans = CarePlan.objects.filter(appointment__patient=patient)
        serializer = CarePlanExtraDataSerializer(care_plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CarePlanByAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, appointment_id):
        user = request.user

        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if user is the patient assigned to this appointment
        is_patient = hasattr(
            user, 'patient') and user.patient == appointment.patient

        # Check if user has staff role or is the patient
        if not (user.role in ['receptionist', 'admin', 'nurse', 'doctor'] or is_patient):
            return Response(
                {"error": "You do not have permission to view these care plans."},
                status=status.HTTP_403_FORBIDDEN
            )

        care_plans = CarePlan.objects.filter(appointment=appointment)
        serializer = CarePlanSerializer(care_plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, appointment_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['receptionist', 'admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to create or update care plans."}, status=status.HTTP_403_FORBIDDEN)

        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the appointment status is "Scheduled"
        if appointment.status != "Scheduled":
            return Response({"error": "Only scheduled appointments can be edited."}, status=status.HTTP_400_BAD_REQUEST)

        # Get the care plan ID from the request data (if exists)
        care_plan_id = request.data.get('id', None)

        if care_plan_id:
            # If care_plan_id exists, try to find the existing care plan
            try:
                care_plan = CarePlan.objects.get(
                    id=care_plan_id, appointment=appointment)
            except CarePlan.DoesNotExist:
                return Response({"error": "Care plan not found for this appointment."}, status=status.HTTP_404_NOT_FOUND)

            # Update the care plan
            # Partial=True allows partial updates
            serializer = CarePlanSerializer(
                care_plan, data=request.data, partial=True)
        else:
            # If no care_plan_id exists, create a new care plan
            # Ensure the care plan is linked to the appointment
            request.data['appointment'] = appointment.id
            log_to_db(
                request,
                "CREATE: Care Plan",
                f"Appointment ID: {appointment.id}, "
                f"Title: {request.data.get('care_plan_title', '')}, "
                f"Type: {request.data.get('care_plan_type', '')}, "
                f"Date of Completion: {request.data.get('date_of_completion', '')}, "
                f"Done By: {request.data.get('done_by', '')}, "
                f"Additional Instructions: {request.data.get('additional_instructions', '')}")
            serializer = CarePlanSerializer(data=request.data)

        # Validate and save the care plan
        if serializer.is_valid():
            care_plan = serializer.save()
            return Response(CarePlanSerializer(care_plan).data, status=status.HTTP_200_OK if care_plan_id else status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, appointment_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['receptionist', 'admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to delete care plans."}, status=status.HTTP_403_FORBIDDEN)

        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the appointment status is "Scheduled"
        if appointment.status != "Scheduled":
            return Response({"error": "Only scheduled appointments can be edited."}, status=status.HTTP_400_BAD_REQUEST)

        # Get the care plan ID from the request data
        care_plan_id = request.data.get('id', None)

        if not care_plan_id:
            return Response({"error": "Care plan ID is required to delete."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            care_plan = CarePlan.objects.get(
                id=care_plan_id, appointment=appointment)
        except CarePlan.DoesNotExist:
            return Response({"error": "Care plan not found for this appointment."}, status=status.HTTP_404_NOT_FOUND)

        # Log
        log_to_db(
            request,
            "DELETE: Care Plan",
            f"Care Plan ID: {care_plan.id}, "
            f"Appointment ID: {appointment.id}, "
            f"Title: {care_plan.care_plan_title}, "
            f"Type: {care_plan.care_plan_type}, "
            f"Date of Completion: {care_plan.date_of_completion}, "
            f"Done By: {care_plan.done_by}, "
            f"Additional Instructions: {care_plan.additional_instructions}"
        )
        # Delete the care plan
        care_plan.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Complete Careplan and adding details for completion


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def completeCareplan(request, careplan_id):
    user = request.user

    # Ensure the user role is either "nurse" or "admin"
    if user.role not in ['nurse', 'admin']:
        return Response({"detail": "Permission denied. Only nurses and admins can complete care plans."}, status=status.HTTP_403_FORBIDDEN)

    # Fetch the CarePlan object
    careplan = get_object_or_404(CarePlan, id=careplan_id)

    # Update the completion time and the nurse who completed it
    careplan.date_of_completion = timezone.now()
    if user.role == 'nurse':
        nurse = get_object_or_404(Employee, user=user)
        careplan.done_by = nurse

    careplan.save()

    return Response({"detail": "Care plan completed successfully."}, status=status.HTTP_200_OK)
