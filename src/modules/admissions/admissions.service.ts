import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IStudentRepository } from '../../infrastructure/repositories/interfaces/student-repository.interface';
import { AdmissionApplicationDto } from './dto/admission-application.dto';
import { v4 as uuidv4 } from 'uuid';

export interface AdmissionApplication {
  id: string;
  applicationNumber: string;
  data: AdmissionApplicationDto;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ENROLLED';
  submittedAt: Date;
}

@Injectable()
export class AdmissionsService {
  private readonly applications = new Map<string, AdmissionApplication>();
  private applicationCounter = 100;

  constructor(
    @Inject('IStudentRepository')
    private readonly studentRepository: IStudentRepository,
  ) {}

  async submitApplication(dto: AdmissionApplicationDto): Promise<AdmissionApplication> {
    this.applicationCounter += 1;
    const applicationNumber = `APP-2026-${this.applicationCounter}`;
    const application: AdmissionApplication = {
      id: uuidv4(),
      applicationNumber,
      data: dto,
      status: 'SUBMITTED',
      submittedAt: new Date(),
    };
    this.applications.set(application.id, application);
    return application;
  }

  async findAll(): Promise<AdmissionApplication[]> {
    return Array.from(this.applications.values());
  }

  async findById(id: string): Promise<AdmissionApplication> {
    const app = this.applications.get(id);
    if (!app) {
      throw new NotFoundException(`Admission application '${id}' not found`);
    }
    return app;
  }

  async enrollCandidate(id: string, sectionId = 'sec-a', academicYearId = 'ay-2026') {
    const app = await this.findById(id);
    const admissionNumber = `ADM-2026-${String(Math.floor(Math.random() * 900) + 100)}`;

    const student = await this.studentRepository.create({
      admissionNumber,
      firstName: app.data.candidateFirstName,
      lastName: app.data.candidateLastName,
      dateOfBirth: app.data.dateOfBirth,
      gender: app.data.gender,
      classId: app.data.appliedClassId,
      sectionId,
      academicYearId,
      parentEmail: app.data.parentEmail,
      parentPhone: app.data.parentPhone,
      address: 'Enrolled via Admission Portal',
      status: 'ACTIVE',
      schoolId: 'SCH-001',
    });

    app.status = 'ENROLLED';
    this.applications.set(id, app);

    return {
      applicationId: app.id,
      admissionNumber,
      student,
    };
  }
}
